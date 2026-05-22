package game

import (
	"fmt"
	"math/rand/v2"
	"slices"
)


type GameLetters struct {
	Round   int `json:"round"`
	Letters  []int 	`json:"_"`
}
/*
This package is responsible for these:
 1. Generating a random latter from a to z
 2 Forming a reseanable length string of letters in a slice
 3.
*/

type LettersInterface interface{
	GroupLetters()([]string, error)
}

func (l *GameLetters)  GroupLetters() ([]string, error) {
	var generated []string
	var notValid bool = true

	// try until we have valid letters 
	seed := rand.N(45-3)+3

    for notValid {
	 generated =[]string{}
	// loop to generate letters
     for i := 0; i<=seed; i++{
         lett := l.GenerateLetter()
		 // append generated letters
		 generated = append(generated, lett)
	}
	 //validate that generated works contain atleast one vowel
	 isValid := l.lettersAreValid(generated)
	 if !isValid {
		fmt.Println("Generated Letters don't meet the requirements, trying again") 
	}
	// not valid is false
	 notValid = false 
	}

    return generated, nil 
}


// VALIDATION 
func(l * GameLetters) lettersAreValid(gn []string ) (bool){
	vowel_count := 0 
    // vowels 
	vowels := []string{"A", "E","I","0","U"}
	for i:=0; i<len(gn); i++{
       if slices.Contains(vowels, gn[i]){
		vowel_count ++
	   }
	}
    // return final values 
	return vowel_count > 1
}

//LETTER GENERATION 
func(l *GameLetters) GenerateLetter() string {
	letters := [26]string{
	"A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", 
	"N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z",
   }
   letter := letters[rand.IntN(len(letters))]
   return letter 
}	
