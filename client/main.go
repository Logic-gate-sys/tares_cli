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

// main entry point of cliet
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
	//
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
	// close socket finally
	defer conn.Close()

	// --------------- USER & SERVER EVENTS(GAME) -----------------
	type status string
	const (
		failed      status = "Failed"
		sent        status = "Sent"
		pending     status = "Pending"
		invalidType status = "Invalid"
		read        state  = "Read"
	)
	type messageStatus struct {
		statusText status
		detail     string
	}
	// channels for client communications
	done := make(chan struct{})
	gameState := make(chan events.GameStateBroadcast)  // server sent broadcast events
	inGameAction := make(chan events.IngameUserAction) // player actions in-game
	inLobbyAction := make(chan events.InlobbyUserAction)
	readStatus := make(chan messageStatus)  // what a read amounts to e.g error, pending, failed etc
	writeStatus := make(chan messageStatus) // what write amouts to e.g error, pending, failed etc

	// ----------------------------- inlobby or ingame broadcast -------------------------------------
	type serverMessage struct {
		msgType string          // type e.g 'ingame-msg' or 'inlobby_msg'
		rawJson json.RawMessage // delay decode
	}

	// all reads 
	go func() {
		defer close(done)
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
			var serverMsg events.RawMessage
			// decode the broadcast message
			if err := json.NewDecoder(reader).Decode(&serverMsg); err != nil {
				fmt.Printf("Faield to read message")
				readStatus <- messageStatus{statusText: failed, detail: err.Error()}
				continue
			}
			// swtich based on which message
			switch serverMsg.MsgType {
			case events.Ingame:
				var ingameMsg events.GameStateBroadcast
				if err := json.Unmarshal(serverMsg.RawJson, &ingameMsg); err != nil {
					readStatus <- messageStatus{statusText: failed, detail: "invalid json"}
					continue
				}
				// pass newlly arrive message to channel
				readStatus <- messageStatus{statusText: read, detail: "Read successful"}
				gameState <- ingameMsg

			// if in lobby action
			case events.Inlobby:
				var inlobbyMsg events.GameStateBroadcast
				if err := json.Unmarshal(serverMsg.RawJson, &inlobbyMsg); err != nil {
					readStatus <- messageStatus{statusText: failed, detail: err.Error()}
					continue
				}
				// pass read text
				readStatus <- messageStatus{statusText: read, detail: "Read successful"}
				gameState <- inlobbyMsg

			// default case
			default:
				readStatus <- messageStatus{statusText: invalidType, detail: "invalid json type"}
			}
		}
	}()

	// client writes in game & inlobby
	go func() {
		for {
			select {
			case action := <-inGameAction:
				writer, err := conn.NextWriter(websocket.TextMessage)
				if err != nil {
					fmt.Println("Failed to send action")
					writeStatus <- messageStatus{statusText: failed, detail: err.Error()}
					continue
				}
				// action to send to server
				jsonData, err := json.Marshal(&action)
				if err != nil {
					fmt.Printf("Failed to marshal json: %v", err)
				}
				msg := events.RawMessage{MsgType: events.Ingame, RawJson: jsonData}
				if err := json.NewEncoder(writer).Encode(msg); err != nil {
					fmt.Printf("Failed to send data buffer to server")
					writeStatus <- messageStatus{statusText: failed, detail: err.Error()}
					continue
				}

				writeStatus <- messageStatus{statusText: sent, detail: "Message sent successfully"}
				defer writer.Close()

			// if message hits inlobby user action
			case action := <- inLobbyAction:

			default: // do nothing
			}
		}
	}()

	// Play & Server game messages combined
	scanner := bufio.NewScanner(os.Stdin)
	fmt.Println("\n")
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
			// exit loop
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
		var playerAction events.IngameUserAction
		switch input {
			// read action 
			case "1":
				playerAction = events.InlobbyUserAction {
					Action: events.GetRooms,
					Value:  map[string]string{"":""}, // needs no value 
				}
				shouldSend = true
				inLobbyAction <- playerAction


			default:
				fmt.Println("Unknow action, try this : 'SEND_ANSWER'")
				shouldSend = false
		}

	// ending game
	select {
	case <-done:
		fmt.Println("Bringing Game to a close...")
		return
	default: // do nothing

	}
}
