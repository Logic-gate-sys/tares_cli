package ws

import (
	"github.com/gorilla/websocket"
	"github.com/logic-gate-sys/tares-cli/server/internals/events"
)

// client holds the state of any connect client at any time
type client struct {
	socket *websocket.Conn // socket connection by which the client communicates
	inboundMessage chan events.GameStateBroadcast // things coming from server to client
	outboundMessage chan events.PlayerAction // things client sent to server 
	room *room
}

type Message struct {
	Answer   string `json:"answer"`
	RoomID    string `json:"room_id"`
	Username  string `json:"username"`
	UserID    string `json:"user_id,omitempty"`
	System    bool   `json:"system"`
	Timestamp string `json:"timestamp,omitempty"`
}

func (c *client) readWord() {
	// take all data in the client's socket
	// give it to the forward channel of room to be read 
	for {
		if _, data, err := c.socket.ReadMessage(); 
		err ==nil{
               c.room.forward <- data
		}else {
			break 
		}
	}
	// close socket
	c.socket.Close()
}

// write to room 
func (c *client) writeWord() {
	// for all sent word messages in the send channel
	// unless an error occurs send them to room 
	for messageWord := range c.send{
		if err := c.socket.WriteMessage(websocket.TextMessage, messageWord);
		 err !=nil{
            break 
		}
	}
	// after all close client socket
	c.socket.Close()
}