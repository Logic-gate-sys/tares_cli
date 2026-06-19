package events

import "encoding/json"

type lobbyAction string 
const (
	CreateRoom lobbyAction = "CREATE_ROOM"
	JoinRoom lobbyAction = "JOIN_ROOM"
	GetRooms  lobbyAction ="GET_ROOMS"
)
type GameRoomAction string 
const (
	SendWord  GameRoomAction = "SEND_WORD"
	PauseGame GameRoomAction = "PAUSE_GAME"
	StopGame  GameRoomAction = "STOP_GAME"
	ResumeGame GameRoomAction = "RESUME_GAME"
)
type InlobbyUserAction struct {
	User     *Player 
	Action    lobbyAction `json:"action"`
	Value    map[string]any  `json:"value"` 
}

type IngameUserAction struct {
	User     *Player 
	Action   GameRoomAction  `json:"action"`
	Value    map[string]any  `json:"value"` 
}

type Player struct {
	Id       string `json:"id"`
	Username string `json:"username"`
	Password string `json:"-"`
	Email    string `json:"email"`
	Token    string `json:"token"`
}


//State broacast is sent to clients 
type GameStateBroadcast struct {
	RoomId        string             `json:"room_id"`
	Round         int                `json:"round"`
	Status        Status             `json:"status"` // e.g., "WAITING", "PLAYING", "PAUSED"
	TimeLeft      int                `json:"time_left"`     // Countdown timer in seconds
	ScrambledWord string             `json:"scrambled_word"` // What players try to solve
	Scores        map[string]int     `json:"scores"`        // Track username -> score mapping` 
	Message       string             `json:"message"`
	Data          interface{}       `json:"data"` // any optional data supplied in broadcast
}

type Status string 

const (
	Playing    Status ="PLAYING"
	Waiting   Status ="WAITING"
	Pause     Status ="PAUSED"
	Stopped   Status ="STOPPED"
)

type message string
const (
	Ingame message ="ingame_msg" // related to lobby
	Inlobby message ="inlobby_msg" // related to in game
)
// any message from client or server is in this format 
type RawMessage struct {
	MsgType     message        `json:"msg_type"`
	RawJson    json.RawMessage `json:"payload"` // holdes raw json to delay decodeing
}
