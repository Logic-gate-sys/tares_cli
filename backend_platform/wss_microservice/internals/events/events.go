package events

import (
	"encoding/json"
	"time"
)

type lobbyAction string

const (
	CreateRoom  lobbyAction = "room:create"
	LeaveRoom   lobbyAction = "room:leave"
	UpdateRoom  lobbyAction = "room:update"
	JoinRoom    lobbyAction = "request:room:join"
	ResolveJoin lobbyAction = "room:join:resolve"
)

type GameRoomAction string

const (
	StartGame  GameRoomAction = "START_GAME"
	SendWord   GameRoomAction = "SEND_WORD"
	PauseGame  GameRoomAction = "PAUSE_GAME"
	StopGame   GameRoomAction = "STOP_GAME"
	ResumeGame GameRoomAction = "RESUME_GAME"
)

type InlobbyUserAction struct {
	User   *Player
	Action lobbyAction     `json:"action"`
	Value  json.RawMessage `json:"value"`
}

type IngameUserAction struct {
	User   *Player
	Action GameRoomAction `json:"action"`
	Value  map[string]any `json:"value"`
}

type Player struct {
	Id       string `json:"id"`
	Username string `json:"username"`
	Password string `json:"-"`
	Email    string `json:"email"`
	Token    string `json:"token"`
}

type Which string

const (
	AvailableRooms      Which = "available:rooms"
	NewRoom             Which = "rooms:new"
	UpdatedRoom         Which = "rooms:update"
	IncomingJoinRequest Which = "incoming:join:request"
	JoinResponse        Which = "rooms:join:response"
	// game states broadcasts and actions types
	GameStarted     Which = "owner:starts:game"
	NewClientJoined Which = "room:new:client-joined"
	ToJoinedClient  Which = "room:to:joined-client"
	ClientLeft      Which = "room:client:left"
)

type LobbyStateBroadcast struct {
	Which   Which  `json:"which"`
	Data    any    `json:"data"`
	Message string `json:"message"`
}

type GameStateBroadcast struct {
	Which   Which  `json:"which"`
	Data    any    `json:"data"` // classicall inteface{}
	Message string `json:"message"`
}

type GameStateData struct {
	RoomId        string         `json:"roomId"`
	Round         int            `json:"round"`
	Status        Status         `json:"status"`
	TimeLeft      int            `json:"timeLeft"`
	ScrambledWord string         `json:"scrambledWord"`
	Scores        map[string]int `json:"scores"`
}

type Status string

const (
	Playing   Status = "PLAYING"
	Waiting   Status = "WAITING"
	Countdown Status = "COUNTDOWN"
	RoundOver Status = "ROUND_OVER"
	Finished  Status = "FINISHED"
	Pause     Status = "PAUSED"
	Stopped   Status = "STOPPED"
)

type message string

const (
	Ingame  message = "in:game"
	Inlobby message = "in:lobby"
)

// any message from client or server is in this format
type RawMessage struct {
	MsgType message         `json:"type"`
	RawJson json.RawMessage `json:"payload"` // holdes raw json to delay decodeing
}

// --------- Room join request format ------------------
type PetitionStats struct {
	Wins     int     `json:"wins"`
	Accuracy float64 `json:"accuracy"` // correct words/total words
	Ping     int     `json:"ping"`     // TODO: how useful should ping be?
}

type PetitionRequest struct {
	ID             string         `json:"id,omitempty"`
	RoomID         string         `json:"roomId,omitempty"`
	RequesterID    int            `json:"requesterId,omitempty"`
	PetitionNumber string         `json:"petitionNumber,omitempty"` // generated on the fly
	Duration       time.Duration  `json:"duration,omitempty"`
	PlayerName     string         `json:"playerName,omitempty"`
	PlayerLevel    string         `json:"playerLevel,omitempty"`
	PlayerRank     string         `json:"playerRank,omitempty"`
	Stats          *PetitionStats `json:"stats,omitempty"`
	TargetRoom     string         `json:"targetRoom,omitempty"`
	HostBypass     string         `json:"hostBypass,omitempty"`
	Status         string         `json:"status"`
	CreatedAt      time.Time      `json:"createdAt"` // keep when it's generated and get time ago in frontend
}
