package ws

import (
	"fmt"
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
	// inbound room event
	inboundEvents  chan events.IngameUserAction
	outBoundEvents chan events.GameStateBroadcast
	join           chan *client
	leave          chan *client
	gameEngine     *engine.Game
	startGame      chan bool
	stopGame       chan bool
	pauseGame      chan bool

	status     events.Status
	round      int
	timeLeft   int
	started    bool
	pausedFrom events.Status
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
			event := events.GameStateBroadcast{
				Which:   events.ToJoinedClient,
				Data:    pr.gameEngine.CurrentGameData(pr.Room.Id, pr.round, pr.status, pr.timeLeft),
				Message: "You're in arena! Awaiting game start...",
			}
			// non blocking broadcast to client
			pr.broadCastGameStateToClientNB(c, event)

			for client := range pr.Clients {
				if client.UserId != c.UserId {
					event := events.GameStateBroadcast{
						Which:   events.NewClientJoined,
						Data:    map[string]string{"name": c.name},
						Message: "New client joined room",
					}
					pr.broadCastGameStateToClientNB(client, event)
				}
			}

		// when a client leaves arena put then in lobby
		case c := <-pr.leave:
			for client := range pr.Clients {
				if client.UserId != c.UserId {
					event := events.GameStateBroadcast{
						Which:   events.ClientLeft,
						Data:    map[string]string{"name": c.name},
						Message: "Client left room",
					}
					pr.broadCastGameStateToClientNB(client, event)
				}
			}
			delete(pr.Clients, c)
			c.room = nil
			log.Printf("Client left Game-Room: %s", pr.Room.Name)

		// when any event arrives in arena
		case action := <-pr.inboundEvents:
			switch action.Action {
			case events.StartGame:
				if action.User == nil || action.User.Id != strconv.Itoa(pr.Room.OwnerId) {
					if action.User != nil {
						for client := range pr.Clients {
							if strconv.Itoa(int(client.UserId)) == action.User.Id {
								event := events.GameStateBroadcast{
									Which:   events.ToJoinedClient,
									Data:    pr.gameEngine.CurrentGameData(pr.Room.Id, pr.round, pr.status, pr.timeLeft),
									Message: "Only the room owner can start the game",
								}
								pr.broadCastGameStateToClientNB(client, event)
							}
						}
					}
					continue
				}
				if pr.started {
					for client := range pr.Clients {
						if strconv.Itoa(int(client.UserId)) == action.User.Id {
							event := events.GameStateBroadcast{
								Which:   events.ToJoinedClient,
								Data:    pr.gameEngine.CurrentGameData(pr.Room.Id, pr.round, pr.status, pr.timeLeft),
								Message: "The game has already started",
							}
							pr.broadCastGameStateToClientNB(client, event)
						}
					}
					continue
				}
				pr.started = true
				pr.round = 1
				pr.status = events.Countdown
				pr.timeLeft = countdownSeconds
				_, err := pr.gameEngine.StartRound()
				if err != nil {
					log.Printf("Failed to generate game word for room %s: %v", pr.Room.Id, err)
					pr.started = false
					continue
				}
				for client := range pr.Clients {
					event := events.GameStateBroadcast{
						Which:   events.GameStarted,
						Data:    pr.gameEngine.CurrentGameData(pr.Room.Id, pr.round, pr.status, pr.timeLeft),
						Message: "Game starting",
					}
					pr.broadCastGameStateToClientNB(client, event)
				}

			case events.PauseGame, events.ResumeGame:
				if action.User == nil || action.User.Id != strconv.Itoa(pr.Room.OwnerId) {
					continue
				}
				if action.Action == events.PauseGame && pr.started &&
					pr.status != events.Finished && pr.status != events.Pause {
					pr.pausedFrom = pr.status
					pr.status = events.Pause
				} else if action.Action == events.ResumeGame && pr.status == events.Pause {
					pr.status = pr.pausedFrom
				}
				for client := range pr.Clients {
					event := events.GameStateBroadcast{
						Which:   events.ToJoinedClient,
						Data:    pr.gameEngine.CurrentGameData(pr.Room.Id, pr.round, pr.status, pr.timeLeft),
						Message: "Game state updated",
					}
					pr.broadCastGameStateToClientNB(client, event)
				}

			case events.SendWord:
				if pr.status == events.Playing && action.User != nil {
					word, ok := action.Value["word"].(string)
					if !ok {
						continue
					}
					difficulty := engine.Easy
					switch pr.round {
					case 2:
						difficulty = engine.Medium
					case 3:
						difficulty = engine.Hard
					}
					score, err := pr.gameEngine.ScoreSubmission(action.User.Id, word, difficulty)
					if err != nil {
						log.Printf("Failed to score word in room %s: %v", pr.Room.Id, err)
						continue
					}
					if score == 0 {
						continue
					}
					for client := range pr.Clients {
						event := events.GameStateBroadcast{
							Which: events.WordSubmitted,
							Data: map[string]any{
								"name":  action.User.Username,
								"word":  word,
								"score": int(score),
								"state": pr.gameEngine.CurrentGameData(pr.Room.Id, pr.round, pr.status, pr.timeLeft),
							},
							Message: fmt.Sprintf("%s unscrambled %s", action.User.Username, word),
						}
						pr.broadCastGameStateToClientNB(client, event)
					}
					for client := range pr.Clients {
						event := events.GameStateBroadcast{
							Which:   events.ToJoinedClient,
							Data:    pr.gameEngine.CurrentGameData(pr.Room.Id, pr.round, pr.status, pr.timeLeft),
							Message: "Word received",
						}
						pr.broadCastGameStateToClientNB(client, event)
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
					if _, err := pr.gameEngine.StartRound(); err != nil {
						log.Printf("Failed to generate round %d word for room %s: %v", pr.round, pr.Room.Id, err)
						pr.status = events.Finished
					}
				}
			}
			for client := range pr.Clients {
				event := events.GameStateBroadcast{
					Which:   events.ToJoinedClient,
					Data:    pr.gameEngine.CurrentGameData(pr.Room.Id, pr.round, pr.status, pr.timeLeft),
					Message: "Game state updated",
				}
				pr.broadCastGameStateToClientNB(client, event)
			}
		}
	}
}

// Broadcasts game state to a connected client non-blockingly.
// Tries to send the event immediately. If inGameToClientEvent chan is full (or if no receiver is listening on the unbuffered channel),
// Go jumps straight to the default block without pausing execution
func (pr *PlayerRoom) broadCastGameStateToClientNB(c *client, event events.GameStateBroadcast) {
	select {
	case c.inGameToClientEvent <- event:

	default:
		log.Printf("Dropping game event for client %s", c.name)
	}
}
