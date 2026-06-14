package main

import (
	"bufio"
	"context"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"strings"

	"github.com/gorilla/websocket"
	"github.com/logic-gate-sys/tares-cli/client/helpers"
	"github.com/logic-gate-sys/tares-cli/server/internals/events"
)

const socketURL = "ws://localhost:8081/ws/rooms"

func main() {
	fmt.Println("::::: TARES <<-->> CHAMPIONSHIP <<-->> HUNTERS :::::\n Follow the prompts below to continue")
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()
	authUser, err := helpers.Auth(ctx)
	if err != nil {
		fmt.Printf("User exited with : %v \n", err)
		return
	}
	// connect authenticated user to socket
	header := make(http.Header)
	hexToken := hex.EncodeToString(authUser.Token.Hash)
	header.Set("Authorization", "Bearer "+hexToken)
	conn, resp, err := websocket.DefaultDialer.Dial(socketURL, header)

	if err != nil {
		fmt.Println("Failed to connect to game socket server")
		if resp != nil {
			buf := make([]byte, 1024)
			n, _ := resp.Body.Read(buf)
			fmt.Printf("Details: %s \n", string(buf[:n]))
			return
		}
		panic(err)
	}
	fmt.Println("Game server joined successful")
	// close socket finally
	defer conn.Close()

	// --------------- USER & SERVER EVENTS(GAME) -----------------
	type status string
	const (
		failed      status = "Failed"
		sent        status = "Sent"
		pending     status = "Pending"
		invalidType status = "Invalid"
	)
	type messageStatus struct {
		statusText status
		detail     string
	}
	// channels for client communications
	done := make(chan struct{})
	gameState := make(chan events.GameStateBroadcast) // server sent broadcast events
	playerAction := make(chan events.PlayerAction)    // player actions in-game
	readStatus := make(chan messageStatus)
	writeStatus := make(chan messageStatus)

	go func() {
		defer close(done)
		var broadcast events.GameStateBroadcast // game broadcast message
		for {
			messageType, reader, err := conn.NextReader()
			if err != nil { // go out
				fmt.Printf("Failed to read next message: %v", err)
				readStatus <- messageStatus{statusText: failed, detail: err.Error()}
				return
			}
			if messageType != websocket.TextMessage {
				fmt.Printf("Received and non-text message")
				readStatus <- messageStatus{statusText: invalidType, detail: "Received and non-text message"}
				continue
			}
			// decode the broadcast message
			if err := json.NewDecoder(reader).Decode(&broadcast); err != nil {
				fmt.Printf("Faield to read message")
				readStatus <- messageStatus{statusText: failed, detail: err.Error()}
				continue
			}
			// send broadcast event down channel
			gameState <- broadcast
			readStatus <- messageStatus{statusText: sent, detail: "Message read successful"}
		}
	}()

	// client writes in game
	go func() {
		for {
			select {
			case action := <-playerAction:
				writer, err := conn.NextWriter(websocket.TextMessage)
				if err != nil {
					fmt.Println("Failed to send action")
					writeStatus <- messageStatus{statusText: failed, detail: err.Error()}

				}
				if err := json.NewEncoder(writer).Encode(action); err != nil {
					fmt.Printf("Failed to send data buffer to server")
					writeStatus <- messageStatus{statusText: failed, detail: err.Error()}
					continue
				}
				writeStatus <- messageStatus{statusText: sent, detail: "Message sent successfully"}
				defer writer.Close()

			default: // do nothing
			}
		}
	}()

	// Play & Server game messages combined
	scanner := bufio.NewScanner(os.Stdin)
	for {
		os.Stdout.WriteString(">>>")
		fmt.Println("You've successfully joined the game lobby room...")
		fmt.Println("A few more actions to consider: ")
		fmt.Println("1. View Available Rooms")
		fmt.Println("2. Select Room ")
		fmt.Println("3. Exit")
		fmt.Print("Enter option (1-3): \n")
		// scann should not falter
		if !scanner.Scan() {
			if err := scanner.Err(); err != nil {
				fmt.Println("Scanner error occured", err)
			} else {
				fmt.Println("Scanner can't scan")
			}
			// break
			break
		}
		//Player actions
		var input string
		input = strings.TrimSpace(scanner.Text())
		var shouldSend bool
		if input == "" {
			continue
		}
		// switching on input entered
		var playerAction events.PlayerAction
		switch input {
		case "1":
			playerAction = events.PlayerAction{
				Action: events.SendWord,
				Value:  map[string]any{"message": "success"},
			}
			shouldSend = true
		case "2":
			playerAction = events.PlayerAction{Action: "PAUSE_GAME"}
			shouldSend = true

		default:
			fmt.Println("Unknow action, try this : 'SEND_ANSWER'")
			shouldSend = false
		}

		// send to server
		if shouldSend {
			if err := conn.WriteJSON(playerAction); err != nil {
				fmt.Println("Failed to send word")
				break
			}
		}

	} // end loop

	select {
	case <-done:
		fmt.Println("Bringing Game to a close...")
		return

	default: // do nothing

	}
}
