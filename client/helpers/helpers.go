package helpers

import (
	"bufio"
	"fmt"
	"os"
	"strings"

	"github.com/gorilla/websocket"
	"github.com/logic-gate-sys/tares-cli/server/internals/events"
)

func TakeInput()(string, string, string){
	var userName,email, password string 
	scanner := bufio.NewScanner(os.Stdin)
	if err := scanner.Err(); err !=nil{
		panic("Can't open std scanner , please try again later")
	}

	for {
     	os.Stdout.WriteString(">>> ")
		for {
			fmt.Println("Enter your username:  ")
			scanner.Scan()
			userName = strings.TrimSpace(scanner.Text())
			if userName =="" {
				fmt.Printf("Invalid username: %s", userName)
				continue
		    }
			break 
	    }

		for {
			fmt.Println("Enter your email address:  ")
		    scanner.Scan()
		    email = strings.TrimSpace(scanner.Text())
		   if email =="" {
			  fmt.Printf("Invalid email: %s", email)
			  continue
		    }
			break
	   }

		for {
			fmt.Println("Enter your password:  ")
			scanner.Scan()
			password = strings.TrimSpace(scanner.Text())
            if password ==""{
				fmt.Printf("Invalid password: %s", password)
				continue
			}
			break 
	   }
	   break 
	}

	return userName,email,password
}

func Authenticate(conn *websocket.Conn, username string, email string, password string ) (*events.Player, events.GameStateBroadcast, error) {
	authPayload := events.PlayerAction{
		Action: "SIGN_UP",
		User: &events.Player{
			Username: username,
			Password: password,
			Email: email,
		},
	}
	// send payload : json
	if err := conn.WriteJSON(authPayload); 
		err !=nil{
          fmt.Println("Failed to authenticate user", err)
		  return nil,events.GameStateBroadcast{}, err
	}
	fmt.Println("Authenticating user,please wait...")
	var inBoundEvents events.GameStateBroadcast 
	if err := conn.ReadJSON(&inBoundEvents);
	       err !=nil{
             return  nil,events.GameStateBroadcast{}, err
		   }
	return authPayload.User,inBoundEvents,  nil
}