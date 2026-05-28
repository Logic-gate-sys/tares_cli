package events

type Action string 
const (
	SendWord  Action = "SEND_WORD"
	PauseGame Action = "PAUSE_GAME"
)

type PlayerAction struct {
	Username string // e.g 'Kojo', 'll_gate' etc
	UserID   string 
	Action   Action
	Value    string  // the value like 'mango' that user sends 
}

type GameStateBroadcast struct {
	Scores  map[string]float32  // map of username ---> scores
	TimeLeft int   // minutes or seconds left
	ActiveStatus   string 
	Notification string // any notification sent to clients in room 
}