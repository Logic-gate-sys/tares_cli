import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type {Room, Request } from "#types/entities"
import type { ClientMessage} from "#types/messages";
import { roomApi } from "../services/roomExtend";


  
export type LobbyState = {
  socketStatus: "disconnected" | "idle" | "connecting" | "connected" | "error";
  availableRooms: Room[];
  message?: string;
  inComingRequests?: Request[];
  showMessages?: boolean;
}

const initialState: LobbyState = {
  availableRooms: [],
  inComingRequests: [],
  socketStatus: 'idle',
  showMessages: false,
}

export const lobbySlice = createSlice({
  name: 'lobby',
  initialState,
  reducers: {
    changeShowMsgStatus: (state, action: PayloadAction<LobbyState['showMessages']>) => {
      state.showMessages = action.payload; 
    },
    changeSocketStatus: (state, action: PayloadAction<LobbyState['socketStatus']>) => {
      state.socketStatus = action.payload
    },
    setAvailableRooms: (state, action: PayloadAction<LobbyState['availableRooms']>) => {
      state.availableRooms = action.payload
    },
    addRoom: (state, action: PayloadAction<Room>) => {
      state.availableRooms.push(action.payload)
    },
    updateRoom: (state, action: PayloadAction<{ updatedRoom: Room }>) => {
      state.availableRooms = state.availableRooms
        .map((room) => room.id === action.payload.updatedRoom.id ?
        action.payload.updatedRoom: room)
    },
    removeRoom: (state, action: PayloadAction<{id: string}>) => {
      state.availableRooms = state.availableRooms.filter(rm=> rm.id !== action.payload.id)
    },
    connectSocket: (state, action: PayloadAction<{ url: string }>) => { },
    pushToLobby: (state, action: PayloadAction<ClientMessage>) => { },
    addRequest: (state, action: PayloadAction<Request>) => { state.inComingRequests.push(action.payload) },
    updateRequests: (state, action: PayloadAction<{ id: string }>) => {
      state.inComingRequests = state.inComingRequests.filter((r) => r.id !== action.payload.id)
    },
    addMessage: (state, action: PayloadAction<string>)=> {state.message = action.payload},

  },

  // There effects outside this slice, this slice should react to relevant effects that 
  // affects it's data state
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



export const {
  changeShowMsgStatus, changeSocketStatus, setAvailableRooms, pushToLobby, connectSocket,
  addRoom,updateRoom, removeRoom, addRequest, addMessage, updateRequests } = lobbySlice.actions;
export default lobbySlice.reducer;
