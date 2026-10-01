import { type Middleware } from "@reduxjs/toolkit";
import { addMessage, addRequest, addRoom,updateRoom, changeSocketStatus, lobbySlice, removeRoom, setAvailableRooms } from "./slices/lobby"
import { changeStatus, gameSlice, setRoom } from "./slices/arena";
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
        switch (res.type) {
          case 'in:lobby':
            if (res.payload.which === "available:rooms") {
              console.log("ROOMS(WSS): ", res.payload.data)
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
              console.log("JOIN RESPONSE: ", {accepted, message, room})
              if (accepted && room) {
                store.dispatch(setRoom(room));
                store.dispatch(changeStatus("room:in"));
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
