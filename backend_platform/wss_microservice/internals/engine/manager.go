package engine

import (
	"crypto"
	"github.com/logic-gate-sys/wss_service/internals/events"
	"time"
)

/*
  Phiyyylosophy of the game: "Hit db less, worry less about db letency"
  Data base is updated after the game:
  - limit db inserts to reduce latency
  - When a user quits or game ends abruptly , all score for the game maybe lost
*/

type GameEngineInterface interface {
	UserScoreWord(word string, diff Difficulty) (float32, error)
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
		state:    events.GameStateBroadcast{},
	}
}

const dictionaryFile = "server/dictionary/game_words.txt"

// This func validates user's submitted word exist and applies the appropriate score
func ScoreWord(word string, diff Difficulty) (float32, error) {
	var baseScore int = 0
	// validate word
	isValid, err := ValidateWord(word, dictionaryFile)
	if err != nil {
		return 0, err
	}
	if isValid {
		// check for the level
		switch diff {
		case Easy:
			baseScore = int(Amateur)
		case Medium:
			baseScore += int(Intermediate)
		case Hard:
			baseScore += int(Expert)
		case Extreme:
			baseScore += 2 * int(Expert)
		default:
			baseScore += 0
		}
		// Return
		return float32(baseScore), nil
	}
	return 0, nil
}

// This returns the game state at any time couting in seconds
func (g *Game) Tick(state *events.GameStateBroadcast) (events.GameStateBroadcast, bool) {
	data, ok := state.Data.(events.GameStateData)
	if !ok {
		data = events.GameStateData{
			RoomId: g.ActiveRoom.ID,
			Scores: g.ActiveRoom.Scores,
		}
	}
	// if time is greater than 0 , decrement
	if data.TimeLeft > 0 {
		data.TimeLeft--
	}
	// if time is less or equals 0
	if data.TimeLeft <= 0 {
		// Rule evaluation: Time is up!
		return events.GameStateBroadcast{
			Which: events.ToJoinedClient,
			Data: events.GameStateData{
				RoomId: data.RoomId, Round: data.Round, Status: events.Stopped,
				TimeLeft: data.TimeLeft, ScrambledWord: data.ScrambledWord, Scores: data.Scores,
			},
		}, true // Signal that the round is over
	}
	// time up
	return events.GameStateBroadcast{
		Which: events.ToJoinedClient,
		Data: events.GameStateData{
			RoomId: data.RoomId, Round: data.Round, Status: events.Playing,
			TimeLeft: data.TimeLeft, ScrambledWord: data.ScrambledWord, Scores: data.Scores,
		},
	}, false // Signal that the round is over
}

// This writes to db after the end of the game, this does not apply when play quits
func (g *Game) UpdatePlayerScore(playerId string, score float32) error {
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
		Which: events.ToJoinedClient,
		Data: events.GameStateData{
			RoomId: g.ActiveRoom.ID,
			Status: events.Playing,
			Scores: g.ActiveRoom.Scores,
		},
	}

}

// core engine function that runs for each room
func (g *Game) Run(state *events.GameStateBroadcast, broadcastChan chan<- events.GameStateBroadcast) {
	// Create a ticker that fires every 1 second
	ticker := time.NewTicker(1 * time.Second)
	defer ticker.Stop()
	for {
		select {
		case <-ticker.C:
			g.mux.Lock()
			broadcastPayload, isRoundOver := g.Tick(state)
			// if round is over
			if isRoundOver {
				data := state.Data.(events.GameStateData)
				data.Round++
				data.TimeLeft = int(g.Duration.Seconds())
				state.Data = data
				g.ActiveRoom.UsedWords = make(map[string]string)
			}
			g.mux.Unlock()

			if broadcastPayload.Data != nil {
				broadcastChan <- broadcastPayload
			}

		case <-g.ActiveRoom.Done:
			return
		}
	}
}
