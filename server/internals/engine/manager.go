package engine

import (
	"errors"
	"github.com/logic-gate-sys/tares-cli/server/internals/events"
)
/*
  Phelosophy of the game: "Hit db less, worry less about db letency"
  Data base is updated after the game:
  - limit db inserts to reduce latency
  - When a user quits or game ends abruptly , all score for the game maybe lost
*/

type GameEngineInterface interface {
	ScoreWord(word string, userId string, diff Difficulty) (float32, error)
	ManageTimer() 
}
const dictionaryFile = "server/dictionary/game_words.txt"

// This func validates user's submitted word exist and applies the appropriate score 
func (g *Game)   ScoreWord(word string, userId string, diff Difficulty) (float32, error){
	 var baseScore int = 0 
    // validate word 
	 isValid, err := ValidateWord(word, dictionaryFile )
	 if err != nil{
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
    return 0, errors.New("Word Not Found!")
}

// This returns the game state at any time couting in seconds
func (g *Game) Tick(state *events.GameState) (events.GameStateBroadcast, bool){
	// if time is greater than 0 , decrement 
    if state.TimeLeft > 0 {
        state.TimeLeft --
	}  
	// if time is less or equals 0 
	if state.TimeLeft <= 0 {
		// Rule evaluation: Time is up!
		return events.GameStateBroadcast{
			RoomID:  state.RoomID,
			Round: state.Round,
			Status: state.ActiveStatus,
			TimeLeft: state.TimeLeft,
			ScrambledWord: state.ScrambledWord,
			Scores: state.Scores,
		}, true // Signal that the round is over
	}
    // time up 
	return events.GameStateBroadcast{
			RoomID:  state.RoomID,
			Round: state.Round,
			Status: state.ActiveStatus,
			TimeLeft: state.TimeLeft,
			ScrambledWord: state.ScrambledWord,
			Scores: state.Scores,
		}, false // Signal that the round is over
}

//  This writes to db after the end of the game, this does not apply when play quits 
func (g *Game) UpdatePlayerScore(playerId string, score float32) (error ) {
	// update this user's score in db 
       return nil 
    // return an error 
}

// Generates In-Game status report after each round : does not retrive directly from db 
// Stats include: 1. User scores for round  2.Accumulative score up to current round 
func (g *Game) GenerateStatsReport() events.GameStateBroadcast {
	// create a struct of status report 
	return events.GameStateBroadcast{

	}

}



// core engine function that runs for each room 
func (g *Game) Run(){
	for{
       // print game started after every second 


	}
}