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
    addRoom: (state, action: PayloadAction<Room>) => {
      state.availableRooms.push(action.payload)
    },
    removeRoom: (state, action: PayloadAction<{id: string}>) => {
      state.availableRooms = state.availableRooms.filter(rm=> rm.id !== action.payload.id)
    },
    connectSocket: (state, action: PayloadAction<{ url: string }>) => { },
    pushToLobby: (state, action: PayloadAction<unknown>) => { },

  },
});


// { type: 'in:lobby', payload: { action: 'room:create', value: formData } }

export const {
  changeSocketStatus, setAvailableRooms, pushToLobby, connectSocket,
  addRoom, removeRoom
} = lobbySlice.actions;
export default lobbySlice.reducer; 