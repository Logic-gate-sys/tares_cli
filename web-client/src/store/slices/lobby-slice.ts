import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import {type Room } from "#types/entities"
import type { ClientMessage } from "#types/messages";
import { roomApi } from "../services/room-extend";

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
    pushToLobby: (state, action: PayloadAction<ClientMessage>) => { },

  },

  extraReducers: (builder) => {
    // optimistically update rooms upon creation
    builder
      .addMatcher(roomApi.endpoints.getRooms.matchFulfilled, (state, action: PayloadAction<Room[]>) => {
        state.availableRooms = action.payload
      })
      // optimistically update rooms upon deletion
      .addMatcher(roomApi.endpoints.deleteRoom.matchFulfilled, (state, action) => {
        const deletedRoomId = action.meta.arg.originalArgs.id;
        if (Array.isArray(state.availableRooms)) 
        state.availableRooms =  state.availableRooms.filter(rm => rm.id !== deletedRoomId)
      })
      .addDefaultCase((state)=> state)
  }
});






export const {changeSocketStatus, setAvailableRooms, pushToLobby, connectSocket,addRoom, removeRoom} = lobbySlice.actions;
export default lobbySlice.reducer;
