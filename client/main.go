package main

import (
	"bufio"
	"context"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"reflect"
	"strings"
	"text/tabwriter"

	"github.com/gorilla/websocket"
	"github.com/logic-gate-sys/tares-cli/client/helpers"
	"github.com/logic-gate-sys/tares-cli/server/internals/events"
	"github.com/logic-gate-sys/tares-cli/server/internals/ws"
)

const socketURL = "ws://localhost:8081/ws/rooms"

// main entry point of cliet
func main() {
	fmt.Println("::::: TARES <<->> CHAMPIONSHIP <<->> HUNTERS :::::\n Follow the prompts below to continue")
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
		failed  status = "Failed"
		sent    status = "Sent"
		pending status = "Pending"
		read    status = "Read"
	)

	type lobbyMessage struct {
		status status
		msg    events.LobbyStateBroadcast
	}
	type gameMessage struct {
		status string
		msg    events.GameStateBroadcast
	}
	// channels for client communications
	done := make(chan struct{})
	inGameAction := make(chan events.IngameUserAction) // player actions in-game
	inLobbyAction := make(chan events.InlobbyUserAction)
	lobbyMsg := make(chan lobbyMessage)
	gameMsg := make(chan gameMessage) // server sent broadcast events

	// ------------------ inlobby or ingame broadcast ---------------------
	type serverMessage struct {
		msgType string          // type e.g 'ingame-msg' or 'inlobby_msg'
		rawJson json.RawMessage // delay decode
	}
	defer func() {
		close(done)
		close(inGameAction)
		close(inLobbyAction)
		close(lobbyMsg)
		close(gameMsg)
	}()
	// all reads
	go func() {
		for {
			messageType, reader, err := conn.NextReader()
			if err != nil { // go out
				fmt.Printf("Failed create next reader: %v", err)
				panic(err)
			}

			if messageType != websocket.TextMessage {
				fmt.Printf("Received and non-text message")
				continue
			}
			var rawMsg events.RawMessage
			// decode the broadcast message
			if err := json.NewDecoder(reader).Decode(&rawMsg); err != nil {
				fmt.Printf("Faield to read message")
				continue
			}
			// swtich based on which message
			switch rawMsg.MsgType {
			case events.Ingame:
				var ingameMsg events.GameStateBroadcast
				if err := json.Unmarshal(rawMsg.RawJson, &ingameMsg); err != nil {
					gameMsg <- gameMessage{status: string(failed)}
					continue
				}
				// pass newlly arrive message to channel
				gameMsg <- gameMessage{status: string(read), msg: ingameMsg}

			// if in lobby action
			case events.Inlobby:
				var inlobbyMsg events.LobbyStateBroadcast
				if err := json.Unmarshal(rawMsg.RawJson, &inlobbyMsg); err != nil {
					lobbyMsg <- lobbyMessage{status: failed}
					continue
				}
				// pass read text
				lobbyMsg <- lobbyMessage{status: read, msg: inlobbyMsg}
				fmt.Println("MESSAGE IS NOT PUT ON GAME MESSAGE CHANNEL <--- ")
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
					panic(err)
				}
				// action to send to server
				jsonData, err := json.Marshal(&action)
				if err != nil {
					fmt.Printf("Failed to marshal json: %v", err)
				}
				msg := events.RawMessage{MsgType: events.Ingame, RawJson: jsonData}
				if err := json.NewEncoder(writer).Encode(msg); err != nil {
					fmt.Printf("Failed to send data buffer to server")
					gameMsg <- gameMessage{status: string(failed)}
					continue
				}
				writer.Close()
				gameMsg <- gameMessage{status: string(sent)}

			// if message hits inlobby user action
			case action := <-inLobbyAction:
				writer, err := conn.NextWriter(websocket.TextMessage)
				if err != nil {
					fmt.Println("Next writer failed, returning...")
					lobbyMsg <- lobbyMessage{status: failed}
					return
				}
				jsonData, err := json.Marshal(&action)
				if err != nil {
					fmt.Printf("Failed to marshal write json: %v", err)
				}
				msg := events.RawMessage{MsgType: events.Inlobby, RawJson: jsonData}
				if err := json.NewEncoder(writer).Encode(msg); err != nil {
					fmt.Printf("Failed to send data buffer to server")
					lobbyMsg <- lobbyMessage{status: failed}
				}
				// flush writter
				writer.Close()
				lobbyMsg <- lobbyMessage{status: sent}

			}
		}
	}()

	// Play & Server game messages combined
	/* Write & read actions in main loop :
	   - main-loop put messages on write channels -> write routines pick up -> send to server
	   - read routines -> read from server -> put on read channels -> main loop picks up show to user
	*/
	scanner := bufio.NewScanner(os.Stdin)
	wrt := tabwriter.NewWriter(os.Stdout, 1, 1, 3, ' ', 0)
	for {
		os.Stdout.WriteString(">>>")
		fmt.Println("You've successfully joined the game lobby room...")
		fmt.Println("A few more actions to consider: ")
		fmt.Println("1. View Available Rooms")
		fmt.Println("2. Select Room ")
		fmt.Println("3. Create Room ")
		fmt.Println("4. Exit")
		fmt.Print("Enter option (1-3): \n")
		// scann should not falter
		if !scanner.Scan() {
			if err := scanner.Err(); err != nil {
				fmt.Println("Scanner error occured", err)
			} else {
				fmt.Println("Scanner can't scan")
			}
			// exit loop
			panic(scanner.Err())
		}
		//user inputs
		var input string
		input = strings.TrimSpace(scanner.Text())
		if input == "" {
			continue
		}
		// switching on input entered
		switch input {
		// user wants to view available rooms <- read
		case "1":
			fmt.Println("Searching for available rooms. Please wait...")
			inLobbyAction <- events.InlobbyUserAction{
				User:   &events.Player{},
				Action: events.GetRooms}

			// a blocking channel retrieveal
			res, ok := <-lobbyMsg
			if !ok {
				fmt.Println("Channel was closed. No more data will ever arrive")
				return
			}
			valType := reflect.ValueOf(res.msg.Data)
			if valType.Kind() != reflect.Slice {
				fmt.Println("No rooms available yet!, create one or wait for others to create one")
			}
			fmt.Fprintln(wrt, "Id\tName\tCapacity\tCurrent-Users")
			fmt.Fprintln(wrt, "---\t--------\t--------\t---------")
			// print all rooms well formatted
			if roomSlice, ok := res.msg.Data.([]*ws.Room); ok {
				for _, rm := range roomSlice {
					fmt.Fprintf(wrt, "%s\t%s\t%d\t%d\n", rm.Id, rm.Name, rm.Capacity, len(rm.Clients))
				}
			}
			wrt.Flush()

			// when user wants to create room
		case "3":
			var name string
			var capacity int
			for {
				fmt.Print("Enter room name: ")
				fmt.Print("\n")
				_, err := fmt.Scanln(&name)
				if err != nil {
					continue
				}
				fmt.Print("Enter room capacity: ")
				fmt.Print("\n")
				_, err = fmt.Scanln(&capacity)
				if err != nil {
					fmt.Println("Invalid input!. Capacity must be uint8")
					continue
				}
				break
			}
			fmt.Println("Creating room...")
			payload := events.InlobbyUserAction{
				Action: events.CreateRoom,
				Value:  map[string]any{"name": name, "capacity": capacity}}
			inLobbyAction <- payload

			sentMsg, ok := <-lobbyMsg
			if !ok {
				fmt.Println("Lobby message closed, no hope of re-open, closign client")
				return
			}
			if sentMsg.status != sent {
				fmt.Println("Failed to create room")
			} else {
				fmt.Printf("Room creation successful. Name: %s, Capacity: %d", name, capacity)
			}
		default:
			fmt.Println("Unknow action, try this: enter a valid option")
			continue
		}

		// ending game
		select {
		case <-done:
			fmt.Println("Bringing Game to a close...")
			return
		default: // do nothing

		}
	}

}
