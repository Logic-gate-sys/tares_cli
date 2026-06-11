package main

import (
	"bufio"
	"context"
	"encoding/hex"
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
	scanner := bufio.NewScanner(os.Stdin)
	fmt.Println("::::: TARES WORD-SCRAMBLE <<-->> CHAMPIONSHIP <<-->> GLITTERS :::::\n Follow the prompts below to continue")
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()
	authUser, err := helpers.Auth(ctx)
	if err != nil{
		fmt.Printf("User exited with : %v \n", err)
		return
	}
	// connect authenticated user to socket 
	header := make(http.Header)
	hexTokenStr:= hex.EncodeToString(authUser.Token.Hash)
	header.Set("Authorization", "Bearer "+ hexTokenStr)
	conn,resp, err := websocket.DefaultDialer.Dial(socketURL, header)

	if err != nil {
		fmt.Println("Failed to connect to game socket server")
		if resp != nil {
			buf := make([]byte, 1024)
			n,_ := resp.Body.Read(buf)
			fmt.Printf("Details: %s \n", string(buf[:n]))
			return
		}
		panic(err)
	}
	// close socket finally
	defer conn.Close()

	//:::::::::::::::::::::::: USER & SERVER EVENTS(GAME) :::::::::::::::::::::::::::::::::
	done := make(chan struct{})
	//Options for user
	go func(){
		defer close(done)
		 for {
	        var broadcast events.GameStateBroadcast
			if err := conn.ReadJSON(&broadcast);
	            err != nil{
		       fmt.Println("Failed to read broadcast message from socker server ")
			   break 
	        }
		
			// if broadcasted event is not empty 
			if broadcast.RoomId !=""{
                 fmt.Printf(
		        "\n--- [LIVE UPDATE] ---"+
				"\nRoom ID:   %s"+
				"\nStatus:    %s"+
				"\nRound:     %d"+
				"\nTime Left: %ds"+
				"\nScramble:  %s"+
				"\nScores:    %v"+
				"\n---------------------\n>> ",
				broadcast.RoomId, broadcast.Status, broadcast.Round,
				broadcast.TimeLeft, broadcast.ScrambledWord, broadcast.Scores)
			}
		}
	}()
	     
	//:::::::::::::::::::: USER ACTIONS ::::::::::::::::::::::
	for {
	os.Stdout.WriteString(">>>")
	// scann should not falter 
	if !scanner.Scan(){
		if err:= scanner.Err(); err !=nil{
			fmt.Println("Scanner error occured", err)
		}else{
           fmt.Println("Scanner can't scan")
		}
		// break 
		break 
	}

    //Player actions 
	var input string
	input =strings.TrimSpace(scanner.Text()) 
	var shouldSend bool  
	if input ==""{
		continue
	}
	// switching on input entered 
	var playerAction events.PlayerAction
	switch input {
	case "SEND_WORD":
		playerAction = events.PlayerAction{
			Action: events.SendWord,
			Value: map[string]any{"message":"success"},
		}
		shouldSend = true 
	case "PAUSE_GAME":
		playerAction = events.PlayerAction{Action: "PAUSE_GAME"}
		shouldSend = true 
	case "RESUME_GAME":
		playerAction = events.PlayerAction{Action: "RESUME_GAME"}
	    shouldSend= true
	case "STOP_GAME":
		playerAction = events.PlayerAction{Action: "STOP_GAME"}
		shouldSend = true 
    default:
		fmt.Println("Unknow action, try this : 'SEND_ANSWER'")
		shouldSend = false
	}

	// send to server
	if shouldSend {
       if err := conn.WriteJSON(playerAction);
			err !=nil{
			fmt.Println("Failed to send word")
			break 
		}
    }
	
}

select {
case <-done:
	fmt.Println("Bringing Game to a close...")
	return 
default :
	}
}