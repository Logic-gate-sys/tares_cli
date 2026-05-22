package main

import (
	// "bufio"
	"fmt"
	"time"
	// "os"

	"github.com/logic-gate-sys/tares-cli/server/internals/game"
)

func main(){
// 	data, err := os.ReadFile("server/dictionary/game_words.txt")
// 	if err !=nil{
// 		fmt.Println("Failed to read entire file", err)
// 		return 
// 	}

//   fmt.Println(string(data) )

//using scanner and bufio 
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


 // reading file with the game read method 
 timeStarted := time.Now()

isValid, err := game.ValidateWord("Jane", "server/dictionary/game_words.txt")
if err !=nil{
		fmt.Println("An error occured", err)
		return 
	}
	fmt.Println("Word is valid: ----->", isValid)
	fmt.Println("Total time spent : ", time.Since(timeStarted))

}


	