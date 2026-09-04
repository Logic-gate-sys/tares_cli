import { type Middleware } from "@reduxjs/toolkit";
import { addRoom, changeSocketStatus, lobbySlice, removeRoom, setAvailableRooms } from "./slices/lobby-slice"
import { gameSlice } from "./slices/ingame-slice";
import type { ServerMessage } from "#types/messages";
import type { Room } from "#types/entities";


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
        switch (res.type) {
          case 'in:lobby':
            if (res.payload.which === "available:rooms") {
              console.log("ROOMS(WSS): ", res.payload.data)
              store.dispatch(setAvailableRooms(res.payload.data as Room[]))
              break;
            }
            if (res.payload.which === "rooms:new") {
              console.log("NEW ROOM: ", res.payload.data)
              store.dispatch(addRoom(res.payload.data));
              break;
            }
            if (res.payload.which === "rooms:off-line") {
              store.dispatch(removeRoom(res.payload.data));
              break; 
            }
            break;
  
          case "in:game":
            console.log("In game message", res.payload.data);
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
    } else if (gameSlice.actions.sendWord.match(action)) {
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify(action.payload))
      }
    };

    return next(action);
  }
}
