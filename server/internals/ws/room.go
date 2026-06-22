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
	// start game engine loop once, when room starts running
	// respond to leave or join room request
	for {
		//start game
		select {
		case <-r.startGame:
			// These are the conditions for a game to start:
			// 1. Signle player: start timer down to 30 seconds when user request play
			// 2. Multiplayer : when room capacity is full, start timer-down 30 seconds
		case <-r.stopGame:
			r.timer.Stop()

		case <-r.pauseGame:
			r.timer.Pause()

		default:
			// do nothin
		}
		select {
		// if a client wants to join room
		case client := <-r.join:
			r.Clients[client] = true
			log.Printf("Client: %s joined room: %s", client.name, r.Name)

		// if client wants to leave room
		case client := <-r.leave:
			// remove client from room
			delete(r.Clients, client)
			log.Printf("Client left room: %s", client.name)

			// When events moves:  server <- client
		case action := <-r.inboundEvents:
			switch action.Action {
			case "START_GAME":
				// ALL GAME ROOM LOGIC HERE
			case "SEND_WORD":
				val, exists := action.Value["word"].(string)
				if exists {
					score, err := r.gameEngine.ScoreWord(val, action.User.Id, engine.Easy)
					if err == nil {
						// go routine to update player score
						go r.gameEngine.UpdatePlayerScore(action.User.Id, score)
					}
				}

			case "PAUSE_GAME":
				r.timer.Pause()
			case "STOP_GAME":
				r.timer.Stop()
			}
			// generate and broadcast stats
			r.outBoundEvents <- r.gameEngine.GenerateStatsReport()

		// if a game message comes in through to the broadcastEvents channel
		// game message can be letters generated for round, round winner announcement,
		// or even game over announcement : Engine will sent this kind of message
		case broadcastMsg := <-r.outBoundEvents:
			// brooad cast the message to all clients
			for client := range r.Clients {
				select {
				// trying sending to client to validate , they're still available
				case client.inGameToClientServer <- broadcastMsg:
					// send message to client
					log.Printf("Sent message to client, waiting for browser to pick it up")
					// if not , client is definately not available, so :
				//close their send channels and remove them from the room
				default:
					delete(r.Clients, client)
				}

			}
		}
		// client actions
		// select {

		//   }
	}
}
