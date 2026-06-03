package engine

import (
	"errors"
	"github.com/logic-gate-sys/tares-cli/server/internals/events"
	"time"
	"crypto"
)
/*
  Phiyyylosophy of the game: "Hit db less, worry less about db letency"
  Data base is updated after the game:
  - limit db inserts to reduce latency
  - When a user quits or game ends abruptly , all score for the game maybe lost
*/


type GameEngineInterface interface {
	ScoreWord(word string, UserId string, diff Difficulty) (float32, error)
	ManageTimer() 
}

// NewGame initializes a new game engine instance
func NewGame(roomId string) *Game {
    return &Game{
        ID: crypto.BLAKE2b_256.Size(),
        ActiveRoom: ActiveRoom{
        ID:        roomId,
        Scores:    make(map[string]int),
        UsedWords: make(map[string]string),
        },
        // By default assuming duration per round is 60 seconds
        Duration: 60 * time.Second, 
		state: events.GameStateBroadcast{

		},
    }
}
const dictionaryFile = "server/dictionary/game_words.txt"

// This func validates user's submitted word exist and applies the appropriate score 
func (g *Game)   ScoreWord(word string, UserId string, diff Difficulty) (float32, error){
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
func (g *Game) Tick(state *events.GameStateBroadcast) (events.GameStateBroadcast, bool){
	// if time is greater than 0 , decrement 
    if state.TimeLeft > 0 {
        state.TimeLeft --
	}  
	// if time is less or equals 0 
	if state.TimeLeft <= 0 {
		// Rule evaluation: Time is up!
		return events.GameStateBroadcast{
			RoomId:  state.RoomId,
			Round: state.Round,
			Status: events.Stopped,
			TimeLeft: state.TimeLeft,
			ScrambledWord: state.ScrambledWord,
			Scores: state.Scores,
		}, true // Signal that the round is over
	}
    // time up 
	return events.GameStateBroadcast{
			RoomId:  state.RoomId,
			Round: state.Round,
			Status: events.Stopped,
			TimeLeft: state.TimeLeft,
			ScrambledWord: state.ScrambledWord,
			Scores: state.Scores,
		}, false // Signal that the round is over
}

//  This writes to db after the end of the game, this does not apply when play quits 
func (g *Game) UpdatePlayerScore(playerId string, score float32) (error ) {
	g.mux.Lock()
	defer g.mux.Unlock()

	g.ActiveRoom.Scores[playerId] += int(score)
	return nil 
}

// Generates In-Game status report after each round : does not retrive directly from db 
// Stats include: 1. User scores for round  2.Accumulative score up to current round 
func (g *Game) GenerateStatsReport() events.GameStateBroadcast {
	g.mux.Lock()
	defer g.mux.Unlock()

	// create a struct of status report 
	return events.GameStateBroadcast{
           RoomId: g.ActiveRoom.ID,
		   Status: "IN_PROGRESS",
		   Scores: g.ActiveRoom.Scores,
	}

}



// core engine function that runs for each room 
func (g *Game) Run(state *events.GameStateBroadcast, broadcastChan chan <- events.GameStateBroadcast) {
    // Create a ticker that fires every 1 second
    ticker := time.NewTicker(1 * time.Second)
    defer ticker.Stop()
    for {
		select{
		case <-ticker.C:
			g.mux.Lock()
			broadcastPayload, isRoundOver :=g.Tick(state)
			// if round is over
			if isRoundOver {
				state.Round ++
				state.TimeLeft = int(g.Duration.Seconds())
				g.ActiveRoom.UsedWords = make(map[string]string)
			}
			g.mux.Unlock()

			if broadcastPayload.Scores !=nil {
               broadcastChan <- broadcastPayload
			}

		case <- g.ActiveRoom.Done:
			return 
		}
	}
}