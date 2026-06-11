package ws

import (
	"net/http"
	"sync"
     "log"
	"github.com/gorilla/websocket"
	"github.com/logic-gate-sys/tares-cli/server/internals/events"
	"github.com/logic-gate-sys/tares-cli/server/internals/middleware"
)

type LobbyAction struct{
	Client *client
	Action events.PlayerAction
}

type roomManager struct {
   sync.RWMutex
   rooms  map[string]*Room // map of all rooms in this manager 
   lobbyClients  map[*client]bool // all clients with no rooms yet
   lobbyLeave   chan *client
   lobbyJoin    chan *client // client with no room joins room manaer through this 
   lobbyInbound  chan LobbyAction
}


func NewRoomManager()*roomManager{
	rm := &roomManager{
		rooms:       make(map[string]*Room),
        lobbyClients: make(map[*client]bool),
        lobbyJoin:    make(chan *client),
        lobbyLeave:   make(chan *client),
        lobbyInbound: make(chan LobbyAction),
	}

	// routine for run 
	go rm.Run()
	return rm 
}

//manages lobby state(creating, joining, leaving, discovering rooms)
func(rm *roomManager) Run(){
	// run loop
	for {
		select {
		case client := <-rm.lobbyJoin:
			rm.lobbyClients[client] = true 
			log.Printf("Client joined lobby, waiting for room match: %s",client.name )
		
		case client := <-rm.lobbyLeave:
			// remove client from lobby and close their inbound channels 
			delete(rm.lobbyClients, client)
			close(client.inboundMessage)

		// if an event is sent to lobby
		case msg := <- rm.lobbyInbound :
			switch msg.Action.Action {
			case "CREATE_ROOM":
				// create room with capacity and name
				name := msg.Action.Value["name"].(string)
				capacity := msg.Action.Value["capacity"].(int)
				room := NewRoom(
					WithCapacity(capacity),
					WithName(name),
				)
				rm.Lock()
				rm.rooms[room.id] = room
				rm.Unlock()
				go room.Run() // main game run function 
				
				//move client from lobby to room
				delete(rm.lobbyClients, msg.Client)
				msg.Client.room = room
				room.join <- msg.Client
			
			case "JOIN_ROOM":
				roomId := msg.Action.Value["roomId"].(string)
				rm.Lock()
                room, exists := rm.rooms[roomId]
				rm.Unlock()
				if exists {
					//move client from lobby to room 
					delete(rm.lobbyClients, msg.Client)
					msg.Client.room = room 
					room.join <- msg.Client
				}else{
					msg.Client.outboundMessages <- events.GameStateBroadcast{
						Message: "No room with such id: "+roomId,
					}
				}

			// to view all available rooms 
            case "GET_ROOMS":
				allRooms := []*Room{}
				idx := 0
				for _, room := range rm.rooms {
					// only the fields relevant to user 
					 toAdd := &Room{
						id: room.id,
						name: room.name,
						capacity: room.capacity,
					}
			       allRooms[idx] = toAdd
				   idx ++
				}

				msg.Client.outboundMessages <- events.GameStateBroadcast{
					Message:"Available rooms",
					Data: allRooms,

				}
			}
		}
	}

}

var (
	socketBufferSize = 1024 // 1kb 
	messageBufferSize = 1024 // 1kb 
)


var upgrader = &websocket.Upgrader{
	 ReadBufferSize: socketBufferSize,
	 WriteBufferSize: socketBufferSize,
	 CheckOrigin: func(r *http.Request) bool {return true} ,
	}

// upgrade http request into a websocket connection 
func (rm *roomManager) HandleWS(w http.ResponseWriter, r *http.Request){
	user := middleware.GetUser(r)
	// upgrade http request 
	socket, err := upgrader.Upgrade(w, r, nil)
	if err !=nil{
		log.Fatal("Socket upgrade failed ")
	}
	// close socket connection 
	defer socket.Close()

    // Create client from authenticated user  
	client := &client{
		name: user.Username,
		socket: socket,
		inboundMessage:  make(chan events.PlayerAction, messageBufferSize),
		room: nil,
		manager: rm,
	}

	// register client with lobby
     rm.lobbyJoin <- client
	// client write  
	go client.writeToClientPump()
	// client read
	go client.readFromClientPump()

	// run manager run  function
	go rm.Run()
}