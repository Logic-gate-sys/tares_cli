package ws

import (
	"log"
	"strconv"
	"time"
	"github.com/logic-gate-sys/wss_service/internals/engine"
	"github.com/logic-gate-sys/wss_service/internals/events"
	"github.com/logic-gate-sys/wss_service/internals/store"
	"github.com/logic-gate-sys/wss_service/internals/timer"
)

const (
	countdownSeconds = 15
	roundSeconds     = 60
	totalRounds      = 3
)

type RoomOption func(*PlayerRoom)

type Status string

const (
	Waiting  Status = "waiting"
	Playing  Status = "playing"
	Finished Status = "finished"
)

type PlayerRoom struct {
	Room    store.CreateRoom `json:"room"`
	Timer   timer.GameClock  `json:"timer"`
	Clients map[*client]bool `json:"clients"`

	inboundEvents  chan events.IngameUserAction
	outBoundEvents chan events.GameStateBroadcast
	join           chan *client
	leave          chan *client
	gameEngine     *engine.Game
	startGame      chan bool
	stopGame       chan bool
	pauseGame      chan bool

	status   events.Status
	round    int
	timeLeft int
	started  bool
}

// Run is the core loop for messages delivery via channel/clients.
func (pr *PlayerRoom) Run() {
	ticker := time.NewTicker(time.Second)
	defer ticker.Stop()

	for {
		select {
		// when a new client enters game room
		case c := <-pr.join:
			pr.Clients[c] = true
			c.room = pr
			if pr.status == "" {
				pr.status = events.Waiting
			}
			log.Printf("Client: %s joined Game-Room: %s", c.name, pr.Room.Name)

			c.inGameToClientEvent <- events.GameStateBroadcast{
				Which: events.ToJoinedClient,
				Data: events.GameStateData{
					RoomId: pr.Room.Id, Round: pr.round, Status: pr.status,
					TimeLeft: pr.timeLeft, Scores: map[string]int{},
				},
				Message: "You're in arena, wait for game start to be initiated...",
			}
			for client := range pr.Clients {
				if client.UserId != c.UserId {
					client.inGameToClientEvent <- events.GameStateBroadcast{
						Which:   events.NewClientJoined,
						Data:    map[string]string{"name": c.name},
						Message: "New client joined room",
					}
				}
			}

		// when a client leaves arena
		case c := <-pr.leave:
			for client := range pr.Clients {
				if client.UserId != c.UserId {
					client.inGameToClientEvent <- events.GameStateBroadcast{
						Which:   events.ClientLeft,
						Data:    map[string]string{"name": c.name},
						Message: "Client left room",
					}
				}
			}
			delete(pr.Clients, c)
			log.Printf("Client left Game-Room: %s for lobby", pr.Room.Name)

		// when any event arrives in arena
		case action := <-pr.inboundEvents:
			switch action.Action {
			case events.StartGame:
				if action.User == nil || action.User.Id != strconv.Itoa(pr.Room.OwnerId) {
					if action.User != nil {
						for client := range pr.Clients {
							if strconv.Itoa(int(client.UserId)) == action.User.Id {
								client.inGameToClientEvent <- events.GameStateBroadcast{
									Which: events.ToJoinedClient,
									Data: events.GameStateData{
										RoomId: pr.Room.Id, Round: pr.round,
										Status: pr.status, TimeLeft: pr.timeLeft,
										Scores: map[string]int{},
									},
									Message: "Only the room owner can start the game",
								}
							}
						}
					}
					continue
				}
				if pr.started {
					for client := range pr.Clients {
						if strconv.Itoa(int(client.UserId)) == action.User.Id {
							client.inGameToClientEvent <- events.GameStateBroadcast{
								Which: events.ToJoinedClient,
								Data: events.GameStateData{
									RoomId: pr.Room.Id, Round: pr.round,
									Status: pr.status, TimeLeft: pr.timeLeft,
									Scores: map[string]int{},
								},
								Message: "The game has already started",
							}
						}
					}
					continue
				}
				pr.started = true
				pr.round = 1
				pr.status = events.Countdown
				pr.timeLeft = countdownSeconds
				for client := range pr.Clients {
					client.inGameToClientEvent <- events.GameStateBroadcast{
						Which:   events.GameStarted,
						Data:    map[string]int{"timer": pr.timeLeft},
						Message: "Game starting",
					}
				}

			case events.PauseGame, events.ResumeGame:
				if action.User == nil || action.User.Id != strconv.Itoa(pr.Room.OwnerId) {
					continue
				}
				if action.Action == events.PauseGame && pr.started &&
					pr.status != events.Finished && pr.status != events.Pause {
					pr.status = events.Pause
				} else if action.Action == events.ResumeGame && pr.status == events.Pause {
					pr.status = events.Playing
				}
				for client := range pr.Clients {
					client.inGameToClientEvent <- events.GameStateBroadcast{
						Which: events.ToJoinedClient,
						Data: events.GameStateData{
							RoomId: pr.Room.Id, Round: pr.round,
							Status: pr.status, TimeLeft: pr.timeLeft,
							Scores: map[string]int{},
						},
						Message: "Game state updated",
					}
				}

			case events.SendWord:
				if pr.status == events.Playing {
					for client := range pr.Clients {
						client.inGameToClientEvent <- events.GameStateBroadcast{
							Which: events.ToJoinedClient,
							Data: events.GameStateData{
								RoomId: pr.Room.Id, Round: pr.round,
								Status: pr.status, TimeLeft: pr.timeLeft,
								Scores: map[string]int{},
							},
							Message: "Word received",
						}
					}
				}
			case events.StopGame:
				return
			}

		// when a time arrives via the ticker channel
		case <-ticker.C:
			if !pr.started || pr.status == events.Finished || pr.status == events.Pause {
				continue
			}
			if pr.timeLeft > 0 {
				pr.timeLeft--
			}
			if pr.timeLeft == 0 {
				switch pr.status {
				case events.Countdown:
					pr.status = events.Playing
					pr.timeLeft = roundSeconds
				case events.Playing:
					if pr.round == totalRounds {
						pr.status = events.Finished
					} else {
						pr.status = events.RoundOver
						pr.timeLeft = countdownSeconds
					}
				case events.RoundOver:
					pr.round++
					pr.status = events.Countdown
					pr.timeLeft = countdownSeconds
				}
			}
			for client := range pr.Clients {
				client.inGameToClientEvent <- events.GameStateBroadcast{
					Which: events.ToJoinedClient,
					Data: events.GameStateData{
						RoomId: pr.Room.Id, Round: pr.round,
						Status: pr.status, TimeLeft: pr.timeLeft,
						Scores: map[string]int{},
					},
					Message: "Game state updated",
				}
			}
		}
	}
}
