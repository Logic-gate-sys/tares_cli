package ws

import (
	"encoding/json"
	"fmt"
	"github.com/gorilla/websocket"
	"github.com/logic-gate-sys/tares-cli/server/internals/events"
)

// Holds the state of any connected device (e.g browser, terminal) at any time
type client struct {
	name                   string          // connect client's name
	socket                 *websocket.Conn // socket connection by which the client communicates over the network with server
	inLobbyToServerMessage chan events.InlobbyUserAction
	inLobbyToClientMessage chan events.GameStateBroadcast
	inGameToServerMessage  chan events.IngameUserAction   //messages coming from browser to server
	inGameToClientServer   chan events.GameStateBroadcast //messages going from server to client
	room                   *Room
	manager                *roomManager
	// should I add acess tokens here?
}

// Take message in clients inbound channel and shovel it down to connected client sockect connection e.g browser
func (c *client) writeToClientPump() {
	// sent all inbound events through socket
	for {
		select {
		// if an ingame broadcast comes in
		case event := <-c.inGameToClientServer:
			jsonEvnt, err := json.Marshal(&event)
			if err != nil {
				fmt.Println("failed to marshal json")
				continue
			}
			msg := events.RawMessage{MsgType: events.Ingame, RawJson: jsonEvnt}
			if err := c.socket.WriteJSON(msg); err != nil {
				fmt.Printf("Failed to send broadcast message to client: %v", err)
				return
			}
		// in a lobby broadcast comes in
		case event := <-c.inLobbyToClientMessage:
			jsonEvnt, err := json.Marshal(&event)
			if err != nil {
				fmt.Println("failed to marshal json")
				continue
			}
			msg := events.RawMessage{MsgType: events.Inlobby, RawJson:jsonEvnt}
			if err := c.socket.WriteJSON(msg); err != nil {
				fmt.Printf("Failed to send lobby broadcast message to client: %v", err)
			}
			
		default: // do nothing
		if err := c.socket.WriteJSON(map[string]string{"error":"invalid message type"}); err != nil {
			fmt.Printf("Failed to send lobby broadcast message to client: %v", err)
		}
		}
	}

}

// Read message from client e.g browser, sent it to inBoundEvents channel of room
func (c *client) readFromClientPump() {
	defer func() {
		c.room.leave <- c
		c.socket.Close()
	}()
	// read actions from client. Action could be inLobbyAction or inRoomAction
	for {
		messageType, reader, err := c.socket.NextReader()
		if err != nil {
			panic("Reading failed, restart server & check what's wrong")
		}
		if messageType != websocket.TextMessage {
			panic("Invalid message type")
		}
		// generic envlope to decode into first
		var msg events.RawMessage
		if err := json.NewDecoder(reader).Decode(&msg); err != nil {
			c.socket.WriteJSON(map[string]string{"error": "Invalid json data"})
			continue
		}
		// switch
		switch msg.MsgType {
		case events.Inlobby:
			var inlobbyMsg events.InlobbyUserAction
			if err := json.Unmarshal(msg.RawJson, &inlobbyMsg); err != nil {
				c.socket.WriteJSON(map[string]string{"error": err.Error()})
			}
			// send to lobby
			c.inLobbyToServerMessage <- inlobbyMsg

		case events.Ingame:
			var ingameMsg events.IngameUserAction
			if err := json.Unmarshal(msg.RawJson, &ingameMsg); err != nil {
				c.socket.WriteJSON(map[string]string{"error": err.Error()})
			}
			// put on ingame action
			c.inGameToServerMessage <- ingameMsg

		default:
			c.socket.WriteJSON(map[string]string{"error": "Invalid player action"})
		}
	}
}
