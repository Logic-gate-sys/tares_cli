package ws

import (
	"github.com/gorilla/websocket"
	"github.com/logic-gate-sys/tares-cli/server/internals/events"
	"log"
	"github.com/logic-gate-sys/tares-cli/server/internals/middleware"
	"ne/htt"
	"sync"
)

type LobbyAction struct {
	Client *client
	Action events.InlobbyUserAction
}

type roomManager struct {
	sync.RWMutex
	rooms        map[string]*Room // map of all rooms in this manager
	lobbyClients map[*client]bool // all clients with no rooms yet
	lobbyLeave   chan *client
	lobbyJoin    chan *client // client with no room joins room manaer through this
	lobbyInbound chan LobbyAction
}

func NewRoomManager() *roomManager {
	rm := &roomManager{
		rooms:        make(map[string]*Room),
		lobbyClients: make(map[*client]bool),
		lobbyJoin:    make(chan *client),
		lobbyLeave:   make(chan *client),
		lobbyInbound: make(chan LobbyAction),
	}
	// routine for run
	go rm.Run()
	return rm
}

// manages lobby state(creating, joining, leaving, discovering rooms)
func (rm *roomManager) Run() {
	// run loop
	for {
		select {
		case client := <-rm.lobbyJoin:
			rm.lobbyClients[client] = true
			log.Printf("Client joined lobby: %s, waiting for room...", client.name)

		case client := <-rm.lobbyLeave:
			// remove client from lobby and close their inbound channels
			delete(rm.lobbyClients, client)
			close(client.inGameToServerMessage)
			close(client.inGameToClientServer)

		// if an event is sent to lobby
		case clientAction := <-rm.lobbyInbound:
			switch clientAction.Action.Action {
			case events.gameRoomAction(events.CreateRoom):
				// create room with capacity and name
				name := clientAction.Action.Value["name"].(string)
				capacity := clientAction.Action.Value["capacity"].(int)
				room := NewRoom(	WithCapacity(capacity),WithName(name))
				rm.Lock()
				rm.rooms[room.id] = room
				rm.Unlock()
				go room.Run() // main game run function
				//move client from lobby to room
				delete(rm.lobbyClients, clientAction.Client)
				clientAction.Client.room = room
				room.join <- clientAction.Client
				
            // incase user wants to join an available room
			case events.gameRoomAction(events.JoinRoom):
				roomId := clientAction.Action.Value["roomId"].(string)
				rm.Lock()
				room, exists := rm.rooms[roomId]
				rm.Unlock()
				// if room exists and is not full 
				if exists && room.capacity >= len(room) {
					//move client from lobby to room
					delete(rm.lobbyClients, clientAction.Client)
					clientAction.Client.room = room
					room.join <- clientAction.Client
				} else if room.capacity == len(room){
					clientAction.Client.inGameToClientServer <- events.GameStateBroadcast{
						Message: "Room is full, look for another room",
					}
				}else {
					clientAction.Client.inGameToClientServer <- events.GameStateBroadcast{
						Message: "No room with such id: " + roomId,
					}
				}
				
				// to view all available rooms
			case events.gameRoomAction(events.GetRooms):
				allRooms := []*Room{}
				idx := 0
				for _, room := range rm.rooms {
					// only the fields relevant to user
					toAdd := &Room{
						id:       room.id,
						name:     room.name,
						capacity: room.capacity,
					}
					allRooms[idx] = toAdd
					idx++
				}
				// push all rooms to client 
				clientAction.Client.inGameToClientServer <- events.GameStateBroadcast{
					Message: "Available rooms",
					Data:    allRooms,
				}
			}
		}
	}

}

var (
	socketBufferSize  = 1024 // 1kb
	messageBufferSize = 1024 // 1kb
)

var upgrader = &websocket.Upgrader{
	ReadBufferSize:  socketBufferSize,
	WriteBufferSize: socketBufferSize,
	CheckOrigin:     func(r *http.Request) bool { return true },// CORS 
}

// upgrade http request into a websocket connection
func (rm *roomManager) HandleWS(w http.ResponseWriter, r *http.Request) {
	// get authenticated user
	user := middleware.GetUser(r)
	// upgrade http request
	socket, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		panic("Socket upgrade failed ")
	}
	// close socket connection
	defer socket.Close()
	er socket.Close()
    // Create client from authenticated user
	client             := &client{
		name: u          ser.Username,
		socket: socket, 
		inboundMessage:  make(chan events.PlayerAction),
		outbo            undMessages: make(chan events.GameStateBroadcast),
		room: ni         l,
		manager: rm,
	}
	// run room & put client on lobbyJoin chan
	m.Run()
     rm.lobbyJoin <- client
	// start client read & write pumps
	go client.writeToClientPump()
	go client.readFromClientPump()
}
