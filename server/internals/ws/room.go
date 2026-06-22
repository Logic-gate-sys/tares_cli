package ws

import (
	"log"

	"github.com/logic-gate-sys/tares-cli/server/internals/engine"
	"github.com/logic-gate-sys/tares-cli/server/internals/events"
	"github.com/logic-gate-sys/tares-cli/server/internals/timer"
)

/*
	 Note:
	      We met three conditions :
		  1. If a client request to join or leave is received we response appropritely
		  2. If a message through the 'forward' channel is received , we responds also
		  3. We make sure in sending message down the client channel , we remove any blocking client
		         like a client that's not only or who is not able to receive message
		# We make this so that onces the messages gets send down the client.send channel, our client's write method will pick it up and write to the client through the socket
*/
type RoomOption func(*Room)

type Room struct {
	Id             string                         // room unique id
	Name           string                         // room name
	Capacity       int                            // number of active-players
	inboundEvents  chan events.IngameUserAction   // events client sent to server room
	outBoundEvents chan events.GameStateBroadcast // events to be broadcasted to clients
	join           chan *client                   // for a client request to join a room
	leave          chan *client                   // for a client requesting to leave a room
	Clients        map[*client]bool               // holds all clients currently in a room
	gameEngine     *engine.Game                   //reference to game engine
	timer          timer.GameClock
	startGame      chan bool
	stopGame       chan bool
	pauseGame      chan bool
}

func WithName(name string) RoomOption {
	return func(r *Room) {
		r.Name = name
	}
}

func WithCapacity(capacity int) RoomOption {
	return func(r *Room) {
		r.Capacity = capacity
	}
}

func NewRoom(opts ...RoomOption) *Room {
	r := &Room{
		Name:           "Unnamed",
		Capacity:       5, // by default , 5 max capacity
		join:           make(chan *client),
		leave:          make(chan *client),
		Clients:        make(map[*client]bool),
		inboundEvents:  make(chan events.IngameUserAction),
		outBoundEvents: make(chan events.GameStateBroadcast),
		startGame:      make(chan bool),
		pauseGame:      make(chan bool),
		stopGame:       make(chan bool),
		timer:          *timer.NewGameClock(),
	}

	r.gameEngine = engine.NewGame(r.Id)
	// loop and update any provided options in room
	for _, roomOpt := range opts {
		roomOpt(r)
	}

	// return modified room
	return r
}

// Run is the core loop for messages delivery via channel/ clients.
// Also takes message from client to engine etc
func (r *Room) Run() {
	for {
		select {
		case client := <-r.join:
			r.Clients[client] = true
			client.manager.lobbyLeave <- client
			log.Printf("Client: %s joined room: %s", client.name, r.Name)

			
		case client := <-r.leave:
			delete(r.Clients, client)
			close(client.inGameToClientServer)
			log.Printf("Client left room: %s", client.name)
		}
	}
}
