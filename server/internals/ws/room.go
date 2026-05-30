package ws

import (
	"log"
	"net/http"

	"github.com/gorilla/websocket"
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
	id     string   // room unique id 
	name   string  // room name
	capacity  int  // number of active-players 
	inBoundEvents chan events.PlayerAction // events client sent to server room 
	broadCastsEvents  chan events.GameStateBroadcast // events to be broadcasted to clients
	join    chan *client // for a client request to join a room 
	leave   chan *client // for a client requesting to leave a room 
	clients map[*client]bool // holds all clients currently in a room 
	gameEngine *engine.Game //reference to game engine
	timer    timer.GameClock
	startGame  chan bool 
	stopGame   chan bool 
	pauseGame  chan bool  
}

func WithName(name string) RoomOption{
	return func(r *Room){
		r.name = name 
	}
}

func WithCapacity(capacity int) RoomOption{
	return func(r *Room){
		r.capacity = capacity
	}
}

func NewRoom(opts ...RoomOption) *Room {
  r := &Room{
	name: "Unnamed",
	capacity: 10, // by default , 10 max capacity
	join:  make(chan *client),
	leave: make(chan *client),
	clients: make(map[*client]bool),
	inBoundEvents: make(chan events.PlayerAction),
	broadCastsEvents: make(chan events.GameStateBroadcast),
	timer: *timer.NewGameClock(),
   }
   // loop and update any provided options in room 
   for _, roomOpt := range opts{
	   roomOpt(r)
   }
   
   // return modified room
   return r 
}


// Run is the core loop for messages delivery via channel/ clients.
// Also takes message from client to engine etc
func (r *Room) Run(){
   // respond to leave or join room request 
   for {
	//start game 
	select {
		case <- r.startGame:
		    // run the game engine in routine
			go r.gameEngine.Run() // 1 Single routine -handling game maths 
		case <- r.stopGame:
			r.timer.Stop()

		case <- r.pauseGame:
			r.timer.Pause()

    	default :
			// do nothin 
	      }
	select {
		// if a client wants to join room
		case client := <-r.join:
			r.clients[client] = true
			log.Printf("Client joined room")

		// if client wants to leave room 
		case client := <-r.leave:
			// remove client from room 
			delete(r.clients, client)
			log.Printf("Client left room ")

		// if a game message comes in through to the broadcastEvents channel
		// game message can be letters generated for round, round winner announcement, 
		// or even game over announcement : Engine will sent this kind of message
		case broadcastMsg := <- r.broadCastsEvents : 
			// brooad cast the message to all clients 
			for client := range r.clients{
				select{
                // trying sending to client to validate , they're still available 
				case client.inboundMessage <- broadcastMsg:
					// send message to client
					log.Printf("Sent message to client, waiting for browser to pick it up")
			    // if not , client is definately not available, so :
				//close their send channels and remove them from the room 
				default :
				    delete(r.clients, client)
					// close client's inbound channel
					close(client.inboundMessage)
				} 
				
			}
	}
    // client actions 
	select {
	case action := <- r.inBoundEvents:
		switch action.Action {
			case "SEND_WORD":
				score , err := r.gameEngine.ScoreWord(action.Value, action.UserID, engine.Easy )
				if err == nil{
					// go routine to update player score
					go r.gameEngine.UpdatePlayerScore(action.UserID, score )
				}
        	case "PAUSE_GAME":
				r.timer.Pause()
			case "STOP_GAME":
				r.timer.Stop()
		}
	   // generate and broadcast stats
	   r.broadCastsEvents <- r.gameEngine.GenerateStatsReport()
	  }
   }
}

const (
	socketBufferSize = 1024 // 1kb
	messageBufferSize = 512 // 512 bytes
)

var upgrader = &websocket.Upgrader{
	ReadBufferSize: socketBufferSize,
	 WriteBufferSize: socketBufferSize,
	}

//  This func is a method on the room struct.
//  Game room is asserted full if the number of clients connected are same as capacity
func (rm *Room) isFull() bool {
	return len(rm.clients) == int(rm.capacity)
}

// turn room into http handler by implementing the ServeHTTP func from http.HandlerFunc
func (r *Room) ServeHTTP(w http.ResponseWriter, req *http.Request){
	// upgrade http request 
	socket, err := upgrader.Upgrade(w, req, nil)
	if err !=nil{
		log.Fatal("Socket upgrade failed ")
	}
    // Client 
	client := &client{
		socket: socket,
		inboundMessage:  make(chan events.GameStateBroadcast, messageBufferSize),
		room: r,
	}
	// defer leave
	defer func(){
		r.leave <- client 
	}()
    // join room 
	r.join <- client 
	// client write  
	go client.writeToClientPump()
	// client read
	go client.readFromClientPump()

	
	// try starting game 
    r.startGame <- true 
}

