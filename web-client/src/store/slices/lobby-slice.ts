import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import {type Room } from "#types/entities"


// "room.joined" | "room.playerLeft"
export type LobbyState = {
  socketStatus:  "disconnected" | "idle" | "connecting" |"connected" |"error";
  availableRooms: Room[];
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
    pushToLobby: (state, action: PayloadAction<unknown>) => { },
    createRoom: (state, action: PayloadAction<unknown>) => { },
  },
});


// { type: 'in:lobby', payload: { action: 'room:create', value: formData } }

export const { changeSocketStatus, setAvailableRooms, pushToLobby,createRoom, connectSocket} = lobbySlice.actions;
export default lobbySlice.reducer; 