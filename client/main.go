package main

import (
	"bufio"
	"fmt"
	"os"
	"strings"

	"github.com/gorilla/websocket"
	"github.com/logic-gate-sys/tares-cli/server/internals/events"
)

type userClient struct {
	name string 
	id   string 
	toSend  chan events.PlayerAction
	received chan events.GameStateBroadcast

}


func main() {
	// connect client to socker server
	WSURL := "ws://localhost:8081/ws/room/12"
	conn,_, err := websocket.DefaultDialer.Dial(WSURL, nil)
	if err !=nil{
		fmt.Println("Failed to connect to socket server")
		panic("Can't connect to socket server")
	}
	
	// go routine for reading server socket messages
	go func(){
		for {
			// type of broadcast event
	        var broadcast events.GameStateBroadcast
			if err = conn.ReadJSON(&broadcast);
	            err !=nil{
		       fmt.Println("Failed to read broadcast message from socker server ")
			   break 
	        }
            fmt.Printf(
		         "\n--- [LIVE UPDATE] ---"+
				"\nRoom ID:   %s"+
				"\nStatus:    %s"+
				"\nRound:     %d"+
				"\nTime Left: %ds"+
				"\nScramble:  %s"+
				"\nScores:    %v"+
				"\n---------------------\n>> ",
				broadcast.RoomID, broadcast.Status, broadcast.Round,
				broadcast.TimeLeft, broadcast.ScrambledWord, broadcast.Scores,
		  )
		}
	}()

	// reading inputs from terminal
	scanner := bufio.NewScanner(os.Stdin)// for inputs from terminal
	for {
		err = scanner.Err()
		if err !=nil{
			panic("Failed to connect scanner")
		}
		// print >> to represent and input taking 
		os.Stdout.WriteString(">>>")
		// scann should not falter 
		if !scanner.Scan(){
			fmt.Println("Scanner can't scan")
			break 
		}
        // 
		input := strings.TrimSpace(scanner.Text())
		if input ==""{
			continue
		}

		// switching on input entered 
		var playerAction events.PlayerAction
		switch input {
		case "SEND_ANSWER":
			playerAction = events.PlayerAction{
				Username: "ll_game",
				UserID: "eo0402034",
				Action: events.SendWord,
				Value: "success",
			}

        default:
			break
		}

		// send to server
		if err := conn.WriteJSON(playerAction);
		 err !=nil{
			fmt.Println("Failed to send word")
			break 
		}

	}
}