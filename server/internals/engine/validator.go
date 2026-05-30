package engine

import (
	"bufio"
	"fmt"
	"os"
	"strings"
	"sync"
)

// This spawns 5 goroutines each scanning job channels
// 1. 1 Go routine scan all words in text file and put the text in a job channel 
// 2. 5 Go routines scan the job channel comparing each text with 'word' 
// 3. Found channel signals an early return if word is found by any go routine scanning job channel
// 4  quit channel signals a final withrawal by the last job scanner 

func ValidateWord(word string, fileName string) (bool, error) {
	// open file
	file, err := os.Open(fileName)
	if err != nil {
		return false, fmt.Errorf("Failed to open text file. Error: %v", err)
	}
	// close file eventually
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
		// wait group for current worker
		wg.Add(1)
		// a go routine for current worker 
		go func() {
			// Eventually remove this work from waitgroup: Add(-1)
			defer wg.Done()
			for current_word := range jobs {
				// has another worker signaled a shutdown
				select {
					case <- quit :
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
			case jobs  <- scanner.Text():
			}
		}
		close(jobs) // peacefully close job channel

	}()

	// wait for all workers in seperate go routines to finish
	waitDone := make(chan struct{})
	go func() {
		// wait for all routines 
		wg.Wait()
		close(waitDone)
	}()
	//Final check
	select {
		case <- found:
			return true, nil
		// case <-waitDone:
		case <- waitDone:
			return false, nil
	}

}
