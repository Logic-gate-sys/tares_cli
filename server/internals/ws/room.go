package ws

import (
	"log"
	"github.com/logic-gate-sys/tares-cli/internals/engine"
	"github.com/logic-gate-sys/tares-cli/internals/events"
	"github.com/logic-gate-sys/tares-cli/internals/store"
	"github.com/logic-gate-sys/tares-cli/internals/timer"
)

/*
	 Note:
	    We met three conditions :
		  1. If a client request to join or leave is received we response appropritely
		  2. If a message through the 'forward' channel is received , we responds also
		  3. We make sure in sending message down the client channel , we remove any blocking client
		         like a client that's not only or who is not able to receive message
		# We make this so that once the messages gets send down the client.send channel, our client's write method will pick it up and write to the client through the socket
*/
type RoomOption func(*PlayerRoom)

type Status string

const (
	Waiting  Status = "waiting"
	Playing  Status = "playing"
	Finished Status = "finished"
)

type PlayerRoom struct {
	Room               store.CreateRoom `json:"room"`
	Timer              timer.GameClock  `json:"timer"`
	Clients            map[*client]bool `json:"clients"` // holds all clients currently in a room
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
		case client := <-pr.join:
			pr.Clients[client] = true
			client.manager.lobbyLeave <- client
			log.Printf("Client: %s joined room: %s", client.name, pr.Room.Name)

		case client := <-pr.leave:
			delete(pr.Clients, client)
			close(client.inGameToClientEvent)
			log.Printf("Client left room: %s", client.name)
		}
	}
}
