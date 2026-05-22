package game
import (
	"sync"
	"time"
	"golang.org/x/net/websocket"
)
// LetterSet represents one round's puzzle
// Generated fresh for each game, lives only in memory
type LetterSet struct {
	Letters    []string // e.g: ["T","A","R","E","S","N","I"]
	ValidWords []string // all words formable from these letters
}
 
// ActiveRoom 
type ActiveRoom struct {
	ID        string
	Players   []*ConnectedPlayer
	LetterSet *LetterSet
	UsedWords map[string]string // word → name 
	Scores    map[string]int    // name → their current score
	StartedAt time.Time
	Done      chan struct{} 
	mu        sync.Mutex   
}




// ConnectedPlayer represents a player actively in a game.
// The Send channel is how the game engine talks to the
// WebSocket goroutine without knowing anything about WebSocket.
type ConnectedPlayer struct {
	Name string
	Send chan interface{} // game engine puts messages here
	Conn *websocket.Conn
}

// Difficulty controls letter generation behavior
type Difficulty string

const (
	Easy    Difficulty = "easy"   // 5 letters, more vowels
	Medium  Difficulty = "medium" // 7 letters, balanced
	Hard    Difficulty = "hard"   // 9 letters, more consonants
	Extreme Difficulty="extremely-hard"
)