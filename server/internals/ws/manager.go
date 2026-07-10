package ws

import (
	"fmt"
	"log"
	"net/http"
	"sync"

	"github.com/gorilla/websocket"
	"github.com/logic-gate-sys/tares-cli/internals/events"
	"github.com/logic-gate-sys/tares-cli/internals/middleware"
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

// broadcastToLobby is a helper method to send the current room list to everyone in the lobby
func (rm *roomManager) broadcastToLobby() {
	var publicRooms []PublicUserRoom
	for _, room := range rm.rooms {
		pbcRoom := NewPublicRoom(room)
		publicRooms = append(publicRooms, pbcRoom)
	}

	// Loop through every client waiting in the lobby and push the update
	for client := range rm.lobbyClients {
		// Non-blocking channel send pattern to prevent one slow client from hanging the entire lobby loop
		select {
		case client.inLobbyToClientEvent <- events.LobbyStateBroadcast{
			Data:    publicRooms,
			Message: "Someone create a new room",
		}:
		default:
			// If a client's channel buffer is full, skip them so the loop keeps moving smoothly
			log.Printf("Skipping broadcast for client %s: buffer full", client.name)
		}
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
			// also search for all rooms in lobby give client results
			var publicRooms []PublicUserRoom
			for _, room := range rm.rooms {
				pbcRoom := NewPublicRoom(room)
				publicRooms = append(publicRooms, pbcRoom)
			}

			client.inLobbyToClientEvent <- events.LobbyStateBroadcast{
				Data:    publicRooms,
				Message: "Available rooms",
			}
			log.Printf("Client: %s joined lobby", client.name)

		// when client leaves lobby
		case client := <-rm.lobbyLeave:
			delete(rm.lobbyClients, client)
			close(client.inLobbyToClientEvent)
			log.Printf("Client: %s left lobby", client.name)

		// if an event is sent to lobby
		case action := <-rm.lobbyInbound:
			switch action.Action.Action {
			case events.CreateRoom:
				// create room with capacity and name
				name := action.Action.Value["name"].(string)
				capacity, ok := action.Action.Value["capacity"].(float64)
				if !ok {
					fmt.Println("Invalid capacity values")
					continue
				}
				room := NewRoom(WithCapacity(int(capacity)), WithName(name))
				rm.Lock()
				rm.rooms[room.Id] = room
				rm.Unlock()
				// leave lobby and join room
				go room.Run()
				// also search for all rooms in lobby give client results
				rm.broadcastToLobby()
				// room.join <- action.Client

			// incase user wants to join an available room
			case events.JoinRoom:
				roomId := action.Action.Value["roomId"].(string)
				rm.Lock()
				room, exists := rm.rooms[roomId]
				rm.Unlock()
				// if room exists and is not full
				if exists && room.Capacity > len(room.Clients) {
					//move client from lobby to room
					room.join <- action.Client
					action.Client.room = room

				} else if room.Capacity == len(room.Clients) {
					action.Client.inLobbyToClientEvent <- events.LobbyStateBroadcast{
						Message: "Room is full, look for another room",
					}
				} else {
					action.Client.inLobbyToClientEvent <- events.LobbyStateBroadcast{
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
				if len(allRooms) == 0 {
					action.Client.inLobbyToClientEvent <- events.LobbyStateBroadcast{Message: "No available rooms"}
				} else {
					// push all rooms to client
					action.Client.inLobbyToClientEvent <- events.LobbyStateBroadcast{
						Message: "Available rooms",
						Data:    allRooms,
					}
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
	client := &client{
		name:                 user.Username,
		socket:               socket,
		inLobbyToClientEvent: make(chan events.LobbyStateBroadcast),
		manager:              rm,
	}
	// run room & put client on lobbyJoin chan
	go rm.Run()
	rm.lobbyJoin <- client

	// start client read & write pumps
	go client.writeToClientPump()
	go client.readFromClientPump()
}
