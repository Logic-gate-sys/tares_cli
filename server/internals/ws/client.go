package ws

import (
	"fmt"
	"github.com/gorilla/websocket"
	"github.com/logic-gate-sys/tares-cli/server/internals/events"
)

// client holds the state of any connect client at any time
type client struct {
	name  string // username 
	socket *websocket.Conn // socket connection by which the client communicates over the network with server
	inboundMessage chan events.PlayerAction //coming from browser to server
	outboundMessages chan events.GameStateBroadcast //going from server to client
	room *Room
	manager *roomManager
}



// Take message in clients inbound channel and shovel it down to connected client e.g browser
func (c *client) writeToClientPump() {
	//defer closing socket 
	defer c.socket.Close()

     // sent all inbound events through socket
	 select {
	 case event := <- c.outboundMessages :
		if err  := c.socket.WriteJSON(event); 
			err != nil{
				fmt.Printf("Failed to send broadcast message to client: %v", err)
				return 
			}
	
	 default: // do nothing 
	 }
}

// Read message from client e.g browser, sent it to inBoundEvents channel of room
func (c *client) readFromClientPump() {
	// defer close 
	defer func(){
		c.room.leave <- c
		c.socket.Close()
	}()

	// after auth, any other user payload
	for {
		var userAction events.PlayerAction 
		if err := c.socket.ReadJSON(&userAction);
		// alert client of error
		err != nil{
			c.outboundMessages <- events.GameStateBroadcast {
		        Status: "INVALID PAYLOAD",
		        Message: "Error, Invalid action provided, please try again",
			}
		}
	    // put read json on the inbound channel
		c.room.inBoundEvents <- userAction
	}
}
