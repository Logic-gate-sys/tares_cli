package ws

import (
	"log"
	"net/http"
	"github.com/gorilla/websocket"
	"github.com/logic-gate-sys/tares-cli/server/internals/engine"
	"github.com/logic-gate-sys/tares-cli/server/internals/events"
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
type RoomOption func(*room)

type room struct {
	id     string   // room unique id 
	name   string  // room name
	capacity  int  // number of active-players 
	inBoundEvents chan events.PlayerAction // events client sent to server room 
	broadCastsEvents  chan events.GameStateBroadcast // events to be broadcasted to clients
	// forward holds the generated letter slice to be sent 
	// to all clients
	forward chan []byte
	join    chan *client // for a client request to join a room 
	leave   chan *client // for a client requesting to leave a room 
	clients map[*client]bool // holds all clients currently in a room 
	gameEngine *engine.Game //reference to game engine
}

func WithName(name string) RoomOption{
	return func(r *room){
		r.name = name 
	}
}

func WithCapacity(capacity int) RoomOption{
	return func(r *room){
		r.capacity = capacity
	}
}

func NewRoom(opts ...RoomOption) *room {
  r := &room{
	name: "Unnamed",
	capacity: 10, // by default , 10 max capacity
	forward: make(chan []byte) ,
	join:  make(chan *client),
	leave: make(chan *client),
	clients: make(map[*client]bool),
   }
   // loop and update any provided options in room 
   for _, roomOpt := range opts{
	   roomOpt(r)
   }
   
   // return modified room
   return r 
}


// Run is the core loop for delivery messages via channel to clients.
// Also takes message from client to engine etc
func (r *room) Run(){
   // respond to leave or join room request 
   for {
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
		// or even game over announcement 
		case broadcastMsg := <- r.broadCastsEvents : 
			// brooad cast the message to all clients 
			for client := range r.clients{
				select{
                // trying sending to client to validate , they're still available 
				case client.inboundMessage <- broadcastMsg:
					// send message to client
					log.Printf("Sent message to client")
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
			r.gameEngine.PauseTimer()
		}
	   // generate and broadcast stats
	   r.broadCastsEvents <- r.gameEngine.GenerateStatsReport(r.id, r.name)

     // when messages come to broadcast channel 
	case stateSnapShot := <- r.broadCastsEvents :
		// send state snapshot to all clients 
		for client := range r.clients{
			client.inboundMessage <- stateSnapShot
		}
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
func (rm *room) isFull() bool {
	return len(rm.clients) == int(rm.capacity)
}

// turn room into http handler by implementing the ServeHTTP func from http.HandlerFunc
func (r *room) ServeHTTP(w http.ResponseWriter, req *http.Request){
	// upgrade http request 
	socket, err := upgrader.Upgrade(w, req, nil)
	if err !=nil{
		log.Fatal("Socket upgrade failed ")
	}

	client := &client{
		socket: socket,
		send: make(chan []byte, messageBufferSize),
		room: r,
	}
	// defer leave
	defer func(){
		r.leave <- client 
	}()
    // join room 
	r.join <- client 
	// client write should be in a go routine 
	go client.writeWord()
	// read with client and write 
	 client.readWord()
}

