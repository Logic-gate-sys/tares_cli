package events

type Action string 
const (
	SendWord  Action = "SEND_WORD"
	PauseGame Action = "PAUSE_GAME"
	StopGame  Action = "STOP_GAME"
)

type PlayerAction struct {
	Username string // e.g 'Kojo', 'll_gate' etc
	UserID   string 
	Action   Action
	Value    string  // the value like 'mango' that user sends 
}

// GameState represents the single source of truth for a live game room's data.
// It lives in-memory within the room goroutine and is updated by the engine.
type GameState struct {
	RoomID        string             `json:"room_id"`
	Round         int                `json:"round"`
	ActiveStatus  string             `json:"active_status"` // e.g., "WAITING", "PLAYING", "PAUSED"
	TimeLeft      int                `json:"time_left"`     // Countdown timer in seconds
	ScrambledWord string             `json:"scrambled_word"` // What players try to solve
	Scores        map[string]float32 `json:"scores"`        // Track username -> score mapping           
}

//State broacast is sent to clients 
type GameStateBroadcast struct {
	RoomID        string             `json:"room_id"`
	Round         int                `json:"round"`
	Status        string                   `json:"status"` // e.g., "WAITING", "PLAYING", "PAUSED"
	TimeLeft      int                `json:"time_left"`     // Countdown timer in seconds
	ScrambledWord string             `json:"scrambled_word"` // What players try to solve
	Scores        map[string]float32 `json:"scores"`        // Track username -> score mapping` 
}

