package ws

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"strconv"
	"sync"
	"time"
	"github.com/google/uuid"
	"github.com/gorilla/websocket"
	"github.com/logic-gate-sys/wss_service/internals/engine"
	"github.com/logic-gate-sys/wss_service/internals/events"
	"github.com/logic-gate-sys/wss_service/internals/grpc"
	"github.com/logic-gate-sys/wss_service/internals/middleware"
	"github.com/logic-gate-sys/wss_service/internals/store"
	"github.com/logic-gate-sys/wss_service/internals/timer"
)

type LobbyAction struct {
	Client *client
	Action events.InlobbyUserAction
}

type roomManager struct {
	sync.RWMutex
	grpcClient     *grpc.UserGRPCClient
	rooms          map[string]*PlayerRoom // map of all rooms in this manager
	lobbyClients   map[*client]bool       // all clients with no rooms yet
	lobbyLeave     chan *client
	lobbyJoin      chan *client // client with no room joins room manaer through this
	lobbyInbound   chan LobbyAction
	roomStore      *store.PostGresRoomStore
	pendingJoins   map[string]*pendingJoin
	userServiceURL string
	runOnce        sync.Once
}

type pendingJoin struct {
	requester *client
	roomID    string
	ownerID   int
}

func NewRoomManager(roomStore *store.PostGresRoomStore, grpcClient *grpc.UserGRPCClient) *roomManager {
	return &roomManager{
		grpcClient:     grpcClient,
		rooms:          make(map[string]*PlayerRoom),
		lobbyClients:   make(map[*client]bool),
		lobbyJoin:      make(chan *client),
		lobbyLeave:     make(chan *client),
		lobbyInbound:   make(chan LobbyAction),
		roomStore:      roomStore,
		pendingJoins:   make(map[string]*pendingJoin),
		userServiceURL: os.Getenv("USER_SERVICE_URL"),
	}
}

// manages lobby state(joining, leaving, discovering rooms)
func (rm *roomManager) Run() {
	// the loop
	for {
		select {
		// when client joins lobby channel
		case client := <-rm.lobbyJoin:
			rm.lobbyClients[client] = true
			// also search for all rooms in lobby give client results
			ctx := context.Background()
			rooms, err := rm.roomStore.GetAllRooms(ctx)
			if err != nil {
				return
			}
			event := events.LobbyStateBroadcast{
				Which:   events.AvailableRooms,
				Data:    rooms,
				Message: "Current online rooms available",
			}
			rm.broadCastLobbyEventToClientNB(client, event)
			log.Printf("Client: %s joined lobby", client.name)

		// TODO: Find a way to ensure room owner client is last to leave lobby(
		// this client need to accepts others into his room/ start , initial game)
		case client := <-rm.lobbyLeave:
			delete(rm.lobbyClients, client)
			close(client.inLobbyToClientEvent)
			log.Printf("Client: %s left lobby", client.name)

		// if an event is sent to lobby
		case action := <-rm.lobbyInbound:
			switch action.Action.Action {
			// room creation, updating and deleting are handled outside websocket, in api routes
			case events.JoinRoom:
				var payload struct {
					RoomId string `json:"roomId"`
				}
				if err := json.Unmarshal(action.Action.Value, &payload); err != nil {
					log.Printf("Failed unmarshall payload. Error: %v", err)
					break
				}
				room, err := rm.roomStore.GetRoomById(context.Background(), payload.RoomId)
				if err != nil {
					log.Println("Error(wss): ", err.Error())
					break
				}
				ownerID, parseErr := strconv.Atoi(room.OwnerId)
				if parseErr != nil {
					break
				}
				// join room-owner into his room without further approval
				if action.Client.UserId == int32(ownerID) {
					err, playerRoom := rm.joinRoom(action.Client, room)
					if err != nil {
						log.Println("Owner failed to join room:", err)
						event := events.LobbyStateBroadcast{
							Which: events.JoinResponse,
							Data:  map[string]any{"accepted": false, "message": err.Error()},
						}
						rm.broadCastLobbyEventToClientNB(action.Client, event)
						break
					}
					// put owner on gameRoom's join channel;
					playerRoom.join <- action.Client
					break
				}

				stats, err := rm.grpcClient.GetUserStats(context.Background(), action.Client.UserId)
				if err != nil {
					// inform client their request did not go through
					log.Println("Failed to load requester stats:", err)
					event := events.LobbyStateBroadcast{
						Which: events.JoinResponse,
						Data:  map[string]any{"accepted": false, "reason": "Invalid request parameters"},
					}
					rm.broadCastLobbyEventToClientNB(action.Client, event)
					break
				}
				// compute request details to send to room:0wner
				petition := events.PetitionRequest{
					ID:             uuid.New().String(),
					RoomID:         payload.RoomId,
					RequesterID:    int(action.Client.UserId),
					PetitionNumber: fmt.Sprintf("Req:%s", uuid.New()),
					CreatedAt:      time.Now(),
					PlayerName:     stats.Name,
					PlayerLevel:    stats.Level,
					Stats: &events.PetitionStats{
						Wins:     int(stats.Stats.Wins),
						Accuracy: stats.Stats.Accuracy,
						Ping:     action.Client.Ping(),
					},
				}
				rm.pendingJoins[petition.ID] = &pendingJoin{
					requester: action.Client,
					roomID:    payload.RoomId,
					ownerID:   ownerID,
				}
				for client := range rm.lobbyClients {
					if client.UserId == int32(ownerID) {
						event := events.LobbyStateBroadcast{
							Which:   events.IncomingJoinRequest,
							Data:    petition,
							Message: "A player is requesting to join your room",
						}
						rm.broadCastLobbyEventToClientNB(client, event)
						break
					}
				}

			case events.ResolveJoin:
				var payload struct {
					RequestID string `json:"requestId"`
					Accepted  bool   `json:"accepted"`
				}
				if err := json.Unmarshal(action.Action.Value, &payload); err != nil {
					break
				}
				pending, ok := rm.pendingJoins[payload.RequestID]
				if !ok {
					break
				}
				delete(rm.pendingJoins, payload.RequestID)
				// if resolved action is to deny requestor
				if !payload.Accepted {
					event := events.LobbyStateBroadcast{
						Which: events.JoinResponse,
						Data:  map[string]any{"accepted": false, "message": "Room owner rejected the request"},
					}
					rm.broadCastLobbyEventToClientNB(pending.requester, event)
					break
				}
				room, err := rm.roomStore.GetRoomById(context.Background(), pending.roomID)
				if err != nil {
					break
				}
				// admit requestor in room
				err, playerRoom := rm.joinRoom(pending.requester, room)
				if err != nil {
					event := events.LobbyStateBroadcast{
						Which: events.JoinResponse,
						Data:  map[string]any{"accepted": false, "message": err.Error()},
					}
					rm.broadCastLobbyEventToClientNB(pending.requester, event)
					break
				}
				// remove requester from lobby and put him in playerRoom.
				delete(rm.lobbyClients, pending.requester)
				// put accepted requester on join channel
				playerRoom.join <- pending.requester
			}
		}
	}
}

// Joins succeful user to requested room
func (rm *roomManager) joinRoom(c *client, room store.RoomViewModel) (error, *PlayerRoom) {
	//  if room is full and it's not null
	if room.Capacity > 0 && rm.rooms[room.ID] != nil && len(rm.rooms[room.ID].Clients) >= room.Capacity {
		return fmt.Errorf("room is full"), nil
	}

	playerRoom := rm.rooms[room.ID]
	// if player room is not in-memory, create and run it's engine once
	if playerRoom == nil {
		ownerID, err := strconv.Atoi(room.OwnerId)
		if err != nil {
			return err, nil
		}
		playerRoom = &PlayerRoom{
			Room: store.CreateRoom{
				Id:                 room.ID,
				OwnerId:            ownerID,
				Name:               room.Name,
				Capacity:           room.Capacity,
				Status:             store.Status(room.Status),
				Icon:               room.Icon,
				IconBgClass:        room.IconBgClass,
				IconTextColorClass: room.IconTextColorClass,
			},
			Timer:          timer.GameClock{},
			Clients:        make(map[*client]bool),
			inboundEvents:  make(chan events.IngameUserAction),
			outBoundEvents: make(chan events.GameStateBroadcast),
			join:           make(chan *client),
			leave:          make(chan *client),
			gameEngine:     engine.NewGame(room.ID),
			startGame:      make(chan bool),
			stopGame:       make(chan bool),
			pauseGame:      make(chan bool),
		}
		rm.rooms[room.ID] = playerRoom
		go playerRoom.Run()
	}
	// assign client game room
	c.room = playerRoom
	//broadcast to client
	event := events.LobbyStateBroadcast{
		Which: events.JoinResponse,
		Data: map[string]any{
			"accepted": true,
			"room":     room,
			"message":  fmt.Sprintf("Success!, welcome to game room: %s", room.Name)},
	}
	rm.broadCastLobbyEventToClientNB(c, event)
	return nil, playerRoom
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

// Broadcasts lobby event to a connected client non-blockingly.
// Tries to send the event immediately. If inLobbyToClientEvent chan is full (or if no receiver is listening on the unbuffered channel),
// Go jumps straight to the default block without pausing execution
func (rm *roomManager) broadCastLobbyEventToClientNB(c *client, event events.LobbyStateBroadcast) {
	select {
	case c.inLobbyToClientEvent <- event:
	default:
		log.Printf("Unable to broadcast to this client: %s", c.name)
	}
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
		UserId:               int32(user.ID),
		socket:               socket,
		inLobbyToClientEvent: make(chan events.LobbyStateBroadcast, 10),
		inGameToClientEvent:  make(chan events.GameStateBroadcast, 10),
		manager:              rm,
	}
	// run room & put client on lobbyJoin chan
	rm.runOnce.Do(func() { go rm.Run() })
	rm.lobbyJoin <- client
	// start client read & write pumps
	go client.writeToClientPump()
	go client.readFromClientPump()
}
