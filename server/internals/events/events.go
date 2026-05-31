package events

type Action string 
const (
	SendWord  Action = "SEND_WORD"
	PauseGame Action = "PAUSE_GAME"
	StopGame  Action = "STOP_GAME"
	ResumeGame Action = "RESUME_GAME"
	SignIn      Action ="SIGN_IN"
	SignOut    Action = "SIGN_OUT"
	SignUp     Action ="SIGN_UP"
)

type PlayerAction struct {
	User     *Player 
	Action   Action  `json:"action"`
	Value    string  `json:"value"` 
}

type Player struct {
	Id       string    `json:"id"`
	Username string `json:"username"`
	Password string `json:"-"`
	Email    string `json:"email"`
	Token    string `json:"token"`
}

// GameState represents the single source of truth for a live game room's data.
// It lives in-memory within the room goroutine and is updated by the engine.
type GameState struct {
	RoomId       string             `json:"room_id"`
	Round         int                `json:"round"`
	ActiveStatus  string             `json:"active_status"` // e.g., "WAITING", "PLAYING", "PAUSED"
	TimeLeft      int                `json:"time_left"`     // Countdown timer in seconds
	ScrambledWord string             `json:"scrambled_word"` // What players try to solve
	Scores        map[string]float32 `json:"scores"`        // Track username -> score mapping           
}

//State broacast is sent to clients 
type GameStateBroadcast struct {
	RoomId        string             `json:"room_id"`
	Round         int                `json:"round"`
	Status        string             `json:"status"` // e.g., "WAITING", "PLAYING", "PAUSED"
	TimeLeft      int                `json:"time_left"`     // Countdown timer in seconds
	ScrambledWord string             `json:"scrambled_word"` // What players try to solve
	Scores        map[string]float32 `json:"scores"`        // Track username -> score mapping` 
	Message       string             `json:"message"`
}

