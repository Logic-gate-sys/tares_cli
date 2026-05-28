package main

import (
	// "bufio"
	"fmt"
	"time"
	"os"

	"github.com/logic-gate-sys/tares-cli/server/internals/game"
)

func main(){
	start :=time.Now()
	data, err := os.ReadFile("server/dictionary/game_words.txt")
	if err !=nil{
		fmt.Println("Failed to read entire file", err)
		return 
	}

  fmt.Println(string(data), "Time spent without Go routines: ", time.Since(start) )

// using scanner and bufio 
// file , err := os.Open("server/dictionary/game_words.txt")
// if err !=nil{
// 	fmt.Println("Failed to open file ", err)
// }
//  scanner := bufio.NewScanner(file)

//   for scanner.Scan(){
//        line:= scanner.Text()
// 	   fmt.Println("Word:------> ", line)
//   }
//  if err:= scanner.Err(); err !=nil{
//      fmt.Println("An error occured", err)
//  }	


// Letter generation test 
  game_letters := game.GameLetters{}
  letter, err := game_letters.GroupLetters()
  if err !=nil{
	fmt.Println("Error: ", err)
	return 
  }
  fmt.Println("Generated letter group: ", len(letter))
 // reading file with the game read method 
 timeStarted := time.Now()

isValid, err := game.ValidateWord("june", "server/dictionary/game_words.txt")
if err !=nil{
		fmt.Println("An error occured:  ", err)
		return 
	}
	fmt.Println("Word is valid: ----->", isValid)
	fmt.Println("Time spent with Go routines", time.Since(timeStarted))

}


	