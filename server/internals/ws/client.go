package ws

import (
	"fmt"

	"github.com/gorilla/websocket"
	"github.com/logic-gate-sys/tares-cli/server/internals/events"
)

// client holds the state of any connect client at any time
type client struct {
	name  string // username 
	socket *websocket.Conn // socket connection by which the client communicates
	inboundMessage chan events.GameStateBroadcast // things coming from server to client
	room *Room
}



// Take message in clients inbound channel and shovel it down to connected client e.g browser
func (c *client) writeToClientPump() {
	//defer closing socket 
	defer func(){
		c.socket.Close()
	}()
     // sent all inbound events through socket
     for inboundEvents := range c.inboundMessage{
        if err := c.socket.WriteJSON(inboundEvents);
	    err !=nil{
		fmt.Printf("Failed to send data to client :%v", err)
		break // 
	   }
	 }
}

// Read message from client e.g browser and sent it to inBoundEvents channel of room
func (c *client) readFromClientPump() {
	// defer close 
	defer func(){
		c.room.leave <- c
		c.socket.Close()
	}()
    // enforce authenticate 
    var authPayload events.PlayerAction 
	if err := c.socket.ReadJSON(&authPayload); 
		err !=nil{
			c.inboundMessage <- events.GameStateBroadcast{
				RoomId: c.room.id,
				Status: "REJECTED",
				Message: "Invalid paylaod, provide a valid payload",
			}
		 //
		 return 
		}
	if authPayload.Action !="SIGNUP" ||authPayload.User.Username ==""{
         c.inboundMessage <- events.GameStateBroadcast{
			RoomId: c.room.id,
			Status: "REJECTED",
			Message: "Unauthorised action. Please signup first",
		 }
	}
	// update client info & give client a pass 
	c.name = authPayload.User.Username
	c.room.join <- c
	c.room.startGame <- true 
	// run an infinit loop at a
	for {
		var action events.PlayerAction 
		if err := c.socket.ReadJSON(&action);
		err !=nil{
			fmt.Printf("Failed to read message from browser : %v", err)
			break 
		}
	    // put read json/struct on outbound channel
		c.room.inBoundEvents <- action
	}
}
