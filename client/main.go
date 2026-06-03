package main

import (
	"bufio"
	"fmt"
	"net/http"
	"net/url"
	"os"
	"strings"

	"github.com/gorilla/websocket"
	"github.com/logic-gate-sys/tares-cli/client/helpers"
	"github.com/logic-gate-sys/tares-cli/server/internals/events"
)

const socketURL = "ws://localhost:8081/ws/rooms"


func main() {
	scanner := bufio.NewScanner(os.Stdin)
	fmt.Println(">>> WELCOME TO TARES CLI WHERE CHAMPIONSHIP GLITTERS IN YOUR TERMINAL <<< \n Please follow the prompts below to continue ")
	//::::::::::::::::::::::: USER VERIFICATION ::::::::::::::::::::
	username, email, password := helpers.TakeInput()
	// use this details to login and get auth token

	// connect authenticated user to socket 
	urlString := url.URL{Scheme: "ws", Host:"localhost:8080", Path: "/ws/rooms"}
	authHeader := http.Header{}
	authHeader.Add("Authorization", "Bearer "+acessToken)
	conn,_, err := websocket.DefaultDialer.Dial(socketURL, nil)
	if err != nil {
		fmt.Println("Error! Failed to connect to game socket server")
		panic(err)
	}
	// close socket finally
	defer conn.Close()
	// authenticate user 
	authUser,inboundEvent,authErr:= helpers.Authenticate(conn, username, email, password)
    if authErr !=nil{
		fmt.Println("faild to authenticate user")
	}
	// Immediate first step : sending authpaylaod
	fmt.Printf("Auth Response: %v \n", inboundEvent)

	//::::::::::::::::::::::::USER & SERVER EVENTS(GAME):::::::::::::::::::::::::::::::::
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
	// print >> to represent and input taking 
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
			User: authUser,
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