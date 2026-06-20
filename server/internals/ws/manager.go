package ws

import (
	"log"
	"net/http"
	"sync"

	"github.com/gorilla/websocket"
	"github.com/logic-gate-sys/tares-cli/server/internals/events"
	"github.com/logic-gate-sys/tares-cli/server/internals/middleware"
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
	return &roomManager{
		rooms:        make(map[string]*Room),
		lobbyClients: make(map[*client]bool),
		lobbyJoin:    make(chan *client),
		lobbyLeave:   make(chan *client),
		lobbyInbound: make(chan LobbyAction),
	}
}

// manages lobby state(creating, joining, leaving, discovering rooms)
func (rm *roomManager) Run() {
	// run loop
	for {
		select {
		// when client joins lobby channel
		case client := <-rm.lobbyJoin:
			rm.lobbyClients[client] = true
			log.Printf("Client: %s joined lobby", client.name)

		// when client leaves lobby
		case client := <-rm.lobbyLeave:
			delete(rm.lobbyClients, client)
			close(client.inLobbyToServerMessage)
			close(client.inLobbyToClientMessage)

		// if an event is sent to lobby
		case action := <-rm.lobbyInbound:
			switch action.Action.Action {
			case events.CreateRoom:
				// create room with capacity and name
				name := action.Action.Value["name"].(string)
				capacity := action.Action.Value["capacity"].(int)
				room := NewRoom(WithCapacity(capacity), WithName(name))
				rm.Lock()
				rm.rooms[room.Id] = room
				rm.Unlock()
				// leave lobby and join room
				rm.lobbyLeave <- action.Client
				go room.Run()
				room.join <- action.Client

			// incase user wants to join an available room
			case events.JoinRoom:
				roomId := action.Action.Value["roomId"].(string)
				rm.Lock()
				room, exists := rm.rooms[roomId]
				rm.Unlock()
				// if room exists and is not full
				if exists && room.Capacity >= len(room.Clients) {
					//move client from lobby to room
					rm.lobbyLeave <- action.Client
					action.Client.room = room
					room.join <- action.Client
				} else if room.Capacity == len(room.Clients) {
					action.Client.inLobbyToClientMessage <- events.LobbyStateBroadcast{
						Message: "Room is full, look for another room",
					}
				} else {
					action.Client.inLobbyToClientMessage <- events.LobbyStateBroadcast{
						Message: "No room with such id: " + roomId,
					}
				}

				// to view all available rooms
			case events.GetRooms:
				allRooms := []*Room{}
				idx := 0
				for _, room := range rm.rooms {
					// only the fields relevant to user
					toAdd := Room{
						Id:       room.Id,
						Name:     room.Name,
						Capacity: room.Capacity,
					}
					// room has a field that contains mutex so must be appended by reference to  preserve values
					allRooms = append(allRooms, &toAdd)
					idx++
				}
				// push all rooms to client
				action.Client.inLobbyToClientMessage <- events.LobbyStateBroadcast{
					Type:    "Get Rooms",
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
	CheckOrigin:     func(r *http.Request) bool { return true }, // CORS
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
	// Create client from authenticated user
	clt := &client{
		name:                   user.Username,
		socket:                 socket,
		inLobbyToClientMessage: make(chan events.LobbyStateBroadcast),
		inLobbyToServerMessage: make(chan events.InlobbyUserAction),
		inGameToServerMessage:  make(chan events.IngameUserAction),
		inGameToClientServer:   make(chan events.GameStateBroadcast),
		room:                   nil,
		manager:                rm,
	}
	// run room & put client on lobbyJoin chan
	go rm.Run()
	rm.lobbyJoin <- clt

	// start client read & write pumps
	go clt.writeToClientPump()
	go clt.readFromClientPump()
}
