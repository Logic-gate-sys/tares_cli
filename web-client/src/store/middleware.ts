import { type Middleware } from "@reduxjs/toolkit";
import { addMessage, addRequest, addRoom,updateRoom, changeSocketStatus, lobbySlice, removeRoom, setAvailableRooms } from "./slices/lobby"
import { applyGameState, changeStatus, gameSlice, setRoom} from "./slices/arena";
import type {  ServerMessage } from "#types/messages";
import type { Room, Request } from "#types/entities";


// socket connection middleware
export const socketMiddleware = (): Middleware => {
  let socket: WebSocket | null = null;

  return (store) => (next) => (action) => {
    if (lobbySlice.actions.connectSocket.match(action)) {
      // close existing socket
      if (socket) socket.close();
      store.dispatch(changeSocketStatus("connecting"));
      socket = new WebSocket(action.payload.url);
      socket.addEventListener("error", () => store.dispatch(changeSocketStatus('error')));

      if (!socket) return;
      // on open
      socket.addEventListener("open", () => { store.dispatch(changeSocketStatus("connected")) });
      // messages from server socket ---> client
      socket.addEventListener("message", (event) => {
        const res = JSON.parse(event.data) as ServerMessage;
        console.log("MESSAGE: ", res.payload)
        switch (res.type) {
          case 'in:lobby':
            if (res.payload.which === "available:rooms") {
              store.dispatch(setAvailableRooms(res.payload.data as Room[]))
              break;
            }
            if (res.payload.which === "rooms:new") {
              store.dispatch(addRoom(res.payload.data));
              break;
            }
            if (res.payload.which === "rooms:update") {
              const room = res.payload.data as Room;
              store.dispatch(updateRoom({updatedRoom: room}));
              break;
            }

            // when join request comes in
            if (res.payload.which === "incoming:join:request") {
              store.dispatch(addRequest(res.payload.data as Request));
              store.dispatch(addMessage(res.payload.message))
              break;
            }
            // join response could produce a rejection/acceptance
            if (res.payload.which === "rooms:join:response") {
              const {accepted, message, room} = res.payload.data;
              if (accepted && room) {
                store.dispatch(setRoom(room));
                store.dispatch(changeStatus("room:in"));
                store.dispatch(applyGameState({ gameState: "WAITING", message: "Waiting for the room owner to start the game" }));
              } else {
                store.dispatch(changeStatus("room:out"))
                store.dispatch(addMessage(message?? "Room join request rejected"));
              }
              break;
            }

            if (res.payload.which === "rooms:off-line") {
              store.dispatch(removeRoom(res.payload.data));
              break;
            }
            break;
          
        // handling ingame events 
          case "in:game":
            switch (res.payload.which) {
              case "room:new:client-joined":
                store.dispatch(applyGameState(res.payload))
                break;
              
              case "room:to:joined-client": 
                console.log("TO JOINED CLIENT EVENT")                
                store.dispatch(applyGameState({
                  gameState: res.payload.data.status,
                  round: { roundNo: res.payload.data.round },
                  timer: res.payload.data.timeLeft,
                  scramble: res.payload.data.scrambledWord,
                  scores: res.payload.data.scores,
                  message: res.payload.message,
                }));
                break;

              // when client left room notify players and update player records in real-time
              case "room:client:left":
                break;
              
              case "owner:starts:game":
                store.dispatch(applyGameState({
                  gameState: "COUNTDOWN",
                  timer: res.payload.data.timer,
                  message: res.payload.message,
                }));
                break;

              default:
                break;
            }
            break;

          default:
            break;
        }
      });

      // closing socket
      socket.addEventListener("close", () => { store.dispatch(changeSocketStatus('disconnected')) });
    };

    // outbound lobby messages
    if (lobbySlice.actions.pushToLobby.match(action)) {
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify(action.payload))
      };
      //  in-game client messages
    } else if (gameSlice.actions.pushToGameRoom.match(action)) {
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify(action.payload))
      }
    };

    return next(action);
  }
}
