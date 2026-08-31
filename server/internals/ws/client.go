package ws

import (
	"encoding/json"
	"fmt"

	"github.com/gorilla/websocket"
	"github.com/logic-gate-sys/tares-cli/internals/events"
)

// Holds the state of any connected device (e.g browser, terminal) at any time
type client struct {
	name                 string          // connect client's name
	socket               *websocket.Conn // socket connection by which the client communicates over the network
	inLobbyToClientEvent chan events.LobbyStateBroadcast
	inGameToClientEvent  chan events.GameStateBroadcast //messages going from server to client
	room                 *PlayerRoom
	manager              *roomManager
}

// Take message in clients inbound channel and shovel it down to connected client sockect connection e.g browser
func (c *client) writeToClientPump() {
	defer func() {
		c.socket.Close()
	}()
	// sent all inbound events through socket
	for {
		select {
		case event, ok := <-c.inGameToClientEvent:
			// if manager closed in game to client channel
			if !ok {
				return
			}
			jsonEvnt, err := json.Marshal(&event)
			if err != nil {
				fmt.Println("failed to marshal json")
				return
			}
			msg := events.RawMessage{MsgType: events.Ingame, RawJson: jsonEvnt}
			writer, err := c.socket.NextWriter(websocket.TextMessage)
			if err != nil {
				fmt.Println("Writer failed, connect again later")
				return
			}
			if err := json.NewEncoder(writer).Encode(&msg); err != nil {
				fmt.Printf("Failed to send broadcast message to client: %v", err)
				return
			}
			// close write to push data to client when done encoding
			writer.Close()

		// in a lobby broadcast comes in
		case event, ok := <-c.inLobbyToClientEvent:
			// if manager closes lobby To client channel
			if !ok {
				return
			}
			jsonEvnt, err := json.Marshal(&event)
			if err != nil {
				fmt.Println("failed to marshal json")
				return
			}
			msg := events.RawMessage{MsgType: events.Inlobby, RawJson: jsonEvnt}
			// attempt writting to client
			writer, err := c.socket.NextWriter(websocket.TextMessage)
			if err != nil {
				fmt.Println("Writer failed, please try and connect again")
				return
			}
			if err := json.NewEncoder(writer).Encode(msg); err != nil {
				fmt.Printf("Failed to send lobby broadcast message to client: %v", err)
			}
			// flush message to client
			fmt.Printf("Lobby event sent to client: %s", c.name)
			writer.Close()
		}

	}
}

// Read message from client e.g browser, sent it to inBoundEvents channel of room
func (c *client) readFromClientPump() {
	defer func() {
		c.socket.Close()
	}()
	for {
		//blocks until a message arrives
		messageType, reader, err := c.socket.NextReader()
		if err != nil {
			// if the action is trigger intensionally by client e.g mount and unmounting if STRICT mode in react,etc
			if websocket.IsCloseError(err, websocket.CloseNormalClosure, websocket.CloseGoingAway, 1005) {
				fmt.Printf("Client %s cleanly disconnected or connection dropped by StrictMode.\n", c.name)
			} else {
				fmt.Printf("Reader failed abnormally for client %s: %v\n", c.name, err)
				return
			}
			// CRITICAL FIX: You must explicitly unregister the client from the room/manager here!
			// Otherwise, the channels will leak or writeToClientPump will panic on a closed socket.
			c.manager.lobbyLeave <- c
			return
		}

		if messageType != websocket.TextMessage {
			fmt.Println("Invalid message type")
			continue
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
			c.manager.lobbyInbound <- LobbyAction{Client: c, Action: inlobbyMsg}

		// in game messsage to should go to room inbound channel
		case events.Ingame:
			var ingameMsg events.IngameUserAction
			if err := json.Unmarshal(msg.RawJson, &ingameMsg); err != nil {
				c.socket.WriteJSON(map[string]string{"error": err.Error()})
			}
			// put on ingame action
			c.room.inboundEvents <- ingameMsg

		default:
			c.socket.WriteJSON(map[string]string{"error": "Invalid player action"})
		}
	}

}
