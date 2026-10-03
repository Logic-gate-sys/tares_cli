import type { Room } from "#types/entities";
import type { ClientMessage } from "#types/messages";
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";


export type GameState = {
  status: "room:out" | "room:in" | "idle"; // socket connection status
  gameState?:  "WAITING" | "COUNTDOWN" | "PLAYING" | "ROUND_OVER" | "FINISHED" | "PAUSED" | "error";
  room?: Room; // users active room
  scores: Record<string, number>; // participants active scores 
  scramble?: string; // what user is to scramble
  word?: string; // word user wants to submit
  round?: { roundNo?: number, winner?: string };
  timer?: number;
  message?: string;
}

const initGameState: GameState = {
  status: "idle",
  scores: {},
}

export const gameSlice = createSlice({
  // state
  name: 'arena',
  initialState: initGameState,
  reducers: {
    setScramble: (state, action: PayloadAction<GameState['scramble']>) => {
      state.scramble = action.payload
    },
    changeStatus: (state, action: PayloadAction<GameState['status']>) => {
      state.status = action.payload;
    },
    setRoom: (state, action: PayloadAction<GameState['room']>) => {
      state.room = action.payload;
    },
    setGameState: (state, action: PayloadAction<GameState['gameState']>) => {
      state.gameState = action.payload;
    },
    setTimer: (state, action: PayloadAction<GameState['timer']>) => {
      state.timer = action.payload;
    },
    setRound: (state, action: PayloadAction<GameState['round']>) => {
      state.round = action.payload;
    },
    setScores: (state, action: PayloadAction<GameState['scores']>) => {
      state.scores = action.payload;
    },
    applyGameState: (state, action: PayloadAction<Partial<GameState>>) => {
      Object.assign(state, action.payload);
    },
    pushToGameRoom: (_state, _action: PayloadAction<ClientMessage>) => { }, // handles all clinet --> server messages sending
  }
})

export const { setScramble, changeStatus,setGameState, setRoom, setTimer, setRound, setScores, applyGameState, pushToGameRoom} = gameSlice.actions;
export default gameSlice.reducer;
