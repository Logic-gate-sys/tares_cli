package ws

import (
	"context"
	"log"
	"net/http"
	"sync"

	"github.com/gorilla/websocket"
	"github.com/logic-gate-sys/tares-cli/internals/events"
	"github.com/logic-gate-sys/tares-cli/internals/middleware"
	"github.com/logic-gate-sys/tares-cli/internals/store"
)

type LobbyAction struct {
	Client *client
	Action events.InlobbyUserAction
}

type roomManager struct {
	sync.RWMutex
	rooms        map[string]*PlayerRoom // map of all rooms in this manager
	lobbyClients map[*client]bool       // all clients with no rooms yet
	lobbyLeave   chan *client
	lobbyJoin    chan *client // client with no room joins room manaer through this
	lobbyInbound chan LobbyAction
}

func NewRoomManager() *roomManager {
	return &roomManager{
		rooms:        make(map[string]*PlayerRoom),
		lobbyClients: make(map[*client]bool),
		lobbyJoin:    make(chan *client),
		lobbyLeave:   make(chan *client),
		lobbyInbound: make(chan LobbyAction),
	}
}

// broadcastToLobby is a helper method to send the current room list to everyone in the lobby
// func (rm *roomManager) broadcastToLobby() {
// 	var publicRooms []PublicUserRoom
// 	for _, room := range rm.rooms {
// 		pbcRoom := NewPublicRoom(room)
// 		publicRooms = append(publicRooms, pbcRoom)
// 	}

// 	// Loop through every client waiting in the lobby and push the update
// 	for client := range rm.lobbyClients {
// 		// Non-blocking channel send pattern to prevent one slow client from hanging the entire lobby loop
// 		select {
// 		case client.inLobbyToClientEvent <- events.LobbyStateBroadcast{
// 			Data:    publicRooms,
// 			Message: "Someone create a new room",
// 		}:
// 		default:
// 			// If a client's channel buffer is full, skip them so the loop keeps moving smoothly
// 			log.Printf("Skipping broadcast for client %s: buffer full", client.name)
// 		}
// 	}
// }

// manages lobby state(joining, leaving, discovering rooms)
func (rm *roomManager) Run() {
	db, err := store.Open()
	if err != nil {
		return
	}
	rmStore := store.NewPostgresRoomStore(db)
	for {
		select {
		// when client joins lobby channel
		case client := <-rm.lobbyJoin:
			rm.lobbyClients[client] = true
			// also search for all rooms in lobby give client results
			ctx := context.Background()
			rooms, err := rmStore.GetAllRooms(ctx)
			if err != nil {
				return
			}
			client.inLobbyToClientEvent <- events.LobbyStateBroadcast{
				Which:   events.AvailableRooms,
				Data:    rooms,
				Message: "Current online rooms available",
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
			// incase user wants to join an available room
			case events.JoinRoom:

				break
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
