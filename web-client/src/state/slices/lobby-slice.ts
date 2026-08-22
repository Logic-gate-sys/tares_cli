import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { type ClientMessage, type GameRoom } from "#types/messages";

 // "room.joined" | "room.playerLeft"
export type LobbyState = {
  socketStatus: "opened" | "closed" | "idle" | "connecting" |"connected" |"error";
  availableRooms: GameRoom[];
  message?: string; 
}


const initialState: LobbyState = {
  availableRooms: [],
  socketStatus: 'idle'
}

export const lobbySlice = createSlice({
  name: 'lobby',
  initialState,
  reducers: {
    changeSocketStatus: (state, action: PayloadAction<LobbyState['socketStatus']>) => {
      state.socketStatus = action.payload
    },
    setAvailableRooms: (state, action: PayloadAction<LobbyState['availableRooms']>) => {
      state.availableRooms = action.payload
    },
    connectSocket: (state, action: PayloadAction<{ url: string }>) => { },
    pushToLobby: (state, action: PayloadAction<ClientMessage>) => { }, 
  },
})


export const { changeSocketStatus, setAvailableRooms, pushToLobby, connectSocket} = lobbySlice.actions;
export default lobbySlice.reducer; 