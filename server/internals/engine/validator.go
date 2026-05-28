package engine

import (
	"bufio"
	"fmt"
	"os"
	"strings"
	"sync"
)

/*
   - Validator performs these functions in the engine
   1. Takes and entered word and compare for it's equivalence in dictionary
      - Have multiple go routines validating the word - read from dict,
	  - Once a Go routine finds a word, the others should stop
	  - If no words is found, the word is not correct
*/

func ValidateWord(word string, fileName string) (bool, error) {
	file, err := os.Open(fileName)
	if err != nil {
		return false, fmt.Errorf("Failed to open text file. Error: %v", err)
	}
	defer file.Close()
	// channels for cordiantion
	jobs := make(chan string, 100) // streams text to all workers
	found := make(chan bool, 1)    // signifies word found or not
	quit := make(chan struct{})    // give and early quit to all workers

	// wait group
	var wg sync.WaitGroup
	//spawn five workers
	numWorkers := 5
	for i := 0; i < numWorkers; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			for current_word := range jobs {
				// has another worker signaled a shutdown
				select {
					case <-quit :
						return
					default:
				}
				// validate word
				if strings.TrimSpace(current_word) == word {
					select {
						case found <- true:
							close(quit)
						default:
					}
					return
				}
			}
		}()
	}

	// stream text from file into job channel
	go func() {
		scanner := bufio.NewScanner(file)
		for scanner.Scan() {
			select {
			case <-quit:
				break
			case jobs <- scanner.Text():
			}
		}
		close(jobs) // peacefully close job channel

	}()

	// waait for all workers in seperate go routines to finish
	waitDone := make(chan struct{})
	go func() {
		wg.Wait()
		close(waitDone)
	}()
	//Final check
	select {
		case <-found:
			return true, nil
		// case <-waitDone:
		case <-waitDone:
			return false, nil
	}

}
