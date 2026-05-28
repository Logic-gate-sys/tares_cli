package engine

import (
	"errors"

	"github.com/logic-gate-sys/tares-cli/server/internals/events"
)


type GameEngineInterface interface {
	ScoreWord(word string, userId string, diff Difficulty) (float32, error)
	ManageTimer() 
}
const dictionaryFile ="server/dictionary/game_words.txt"

// combine word validation and score generation together 
func (g *Game)   ScoreWord(word string, userId string, diff Difficulty) (float32, error){
	 var baseScore int = 0 
    // validate word 
	 isValid, err := ValidateWord(word, dictionaryFile )
	 if err !=nil{
		return 0, err
	 }
	 if isValid {
		// check for the level 
		switch  diff {
		case Easy:
			baseScore = int(Amateur)
		case Medium:
			baseScore += int(Intermediate)
		case Hard:
			baseScore += int(Expert)
        case Extreme:
			baseScore += 2*int(Expert)
		default:
			baseScore +=0
		}
		// Return 
		return float32(baseScore), nil
	 }
    return 0, errors.New("Invalid word")
}

func(g *Game) PauseTimer() {

}


func (g *Game) UpdatePlayerScore(id string, score float32) (error ) {
	// update this user's score in db 

    // return an error 
}

func (g *Game) GenerateStatsReport(id string, name string) events.GameStateBroadcast {

}