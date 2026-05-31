package main

import (
	"bufio"
	"fmt"
	"os"
	"strings"

	"github.com/gorilla/websocket"
	"github.com/logic-gate-sys/tares-cli/server/internals/events"
)

const socketURL = "ws://localhost:8081/ws/room/12"


func main() {
	scanner := bufio.NewScanner(os.Stdin)
	fmt.Println(">>> WELCOME TO TARES CLI WHERE CHAMPIONSHIP GLITTERS IN YOUR TERMINAL <<< \n Please follow the prompts below to continue ")
	//taking use details
	os.Stdout.WriteString(">>>> ")
	fmt.Println("Enter your username: ")
	scanner.Scan()
	userName := strings.TrimSpace(scanner.Text())

	fmt.Println("Enter your email address:  ")
	scanner.Scan()
	email := strings.TrimSpace(scanner.Text())

	fmt.Println("Enter your password:  ")
	scanner.Scan()
	password := strings.TrimSpace(scanner.Text())


	// connect client to socker server
	conn,_, err := websocket.DefaultDialer.Dial(socketURL, nil)
	if err != nil {
		fmt.Println("Error! Failed to connect to game socket server")
		panic(err)
	}
	// close socket finally
	defer conn.Close()

	// Immediate first step : sending authpaylaod
	authPayload := events.PlayerAction{
		Action: "SIGN_UP",
		User: &events.Player{
			Username: userName,
			Password: password,
			Email: email,
		},
	}
	if err := conn.WriteJSON(authPayload); 
		err !=nil{
          fmt.Println("Failed to authenticate user", err)
		  return
	}
	fmt.Println("Authenticating user , please wait ....")

	done := make(chan struct{})
	//Options for user
	go func(){
		defer close(done)
		 for {
			// ::::::::::::::: SERVER SENT EVENTS ::::::::::::::::::
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
	case "SEND_	WORD":
		playerAction = events.PlayerAction{
			User: authPayload.User,
			Action: events.SendWord,
			Value: "success",
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