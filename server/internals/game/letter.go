package game

import (
	// "crypto/rand"
	"errors"
	"math/rand"
	"slices"
)


type Letters struct {
	Round   int `json:"round"`
	Letters  []int 	`json:"_"`
}
/*
This package is responsible for these:
 1. Generating a random latter from a to z
 2 Forming a reseanable length string of letters in a slice
 3.
*/

func(l *Letters) GenerateLetter() string {
	letters := [26]string{
	"A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", 
	"N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z",
   }
   letter := letters[rand.Intn(len(letters))]
   return letter 
}	


func (l *Letters)  GroupLetters(seed int) ([]string, error) {
	if seed <3{
		return nil, errors.New("Invalid seed, seed must be greater  or equal to 3")
	}
	generated := []string {}
	isValid := false 

	// try until we have valid letters 
    for isValid {
	 generated =[]string{}
	// loop to generate words
     for i := 0; i<=seed; i++{
         lett := l.GenerateLetter()
		 // append generated letters
		 generated = append(generated, lett)
	}
	 //validate that generated works contain atleast one vowel
	 isValid = l.lettersAreValid(generated)
	 if !isValid {
		return nil, errors.New("Generated Letters don't meet the requirements") 
	}
	}
    return generated, nil 
}


func(l * Letters) lettersAreValid(gn []string ) (bool){
	vowel_count := 0 
    // vowels 
	vowels := []string{"A", "E","I","0","U"}
	for i:=0; i<len(gn); i++{
       if slices.Contains(vowels, gn[i]){
		vowel_count ++
	   }
	}
    // return final values 
	return vowel_count>0
}