package ws

import (
	"log"
	"github.com/logic-gate-sys/wss_service/internals/engine"
	"github.com/logic-gate-sys/wss_service/internals/events"
	"github.com/logic-gate-sys/wss_service/internals/store"
	"github.com/logic-gate-sys/wss_service/internals/timer"
)

type RoomOption func(*PlayerRoom)

type Status string

const (
	Waiting  Status = "waiting"
	Playing  Status = "playing"
	Finished Status = "finished"
)

type PlayerRoom struct {
	Room    store.CreateRoom `json:"room"`
	Timer   timer.GameClock  `json:"timer"`
	Clients map[*client]bool `json:"clients"` // active clients in game
	// channels
	inboundEvents  chan events.IngameUserAction   // events client sent to server room
	outBoundEvents chan events.GameStateBroadcast // events to be broadcasted to clients
	join           chan *client                   // for a client request to join a room
	leave          chan *client                   // for a client requesting to leave a room
	gameEngine     *engine.Game                   //reference to game engine
	startGame      chan bool
	stopGame       chan bool
	pauseGame      chan bool
}

// Run is the core loop for messages delivery via channel/ clients.
// Also takes message from client to engine etc
func (pr *PlayerRoom) Run() {
	for {
		select {
	 // when  Join event arrives via room's channel
		case client := <-pr.join:
			pr.Clients[client] = true
			// client.manager.lobbyLeave <- client
			log.Printf("Client: %s joined Game-Room: %s", client.name, pr.Room.Name)

		// when client leaves arena, they should be returned to lobby
		case client := <-pr.leave:
			delete(pr.Clients, client)
			close(client.inGameToClientEvent)
			// return client to lobby
			client.manager.lobbyJoin <- client
			log.Printf("Client left Game-Room: %s for lobby", client.name)
		}
	}
}
