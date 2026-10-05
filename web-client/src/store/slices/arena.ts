import type { Room } from "#types/entities";
import type { ClientMessage } from "#types/messages";
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";


export type GameState = {
  status: "room:out" | "room:in" | "idle"; // socket connection status
  gameState?:  "WAITING" | "COUNTDOWN" | "PLAYING" | "ROUND_OVER" | "FINISHED" | "PAUSED" | "error";
  room?: Room; // users active room
  playersStats: {name: string,scramble?: string, cumlativeScore: number}[]// participants active stats 
  activeUserStats?: { score?: number, rank?: string, accuracy?:string, words?: string , scrambles?: string[]};
  scramble: string; // scramble all players are to answer
  round?: { roundNo?: number, winner?: string };
  timer?: number;
  scores?: Record<string, number>;
  wordCounts?: Record<string, number>;
  liveFeed: { id: number, user: string, word: string, score: number }[];
  message?: string;
}

const initGameState: GameState = {
  status: "idle",
  playersStats: [],
  scramble: '',
  liveFeed: [],
  
}

export const gameSlice = createSlice({
  // state
  name: 'arena',
  initialState: initGameState,
  reducers: {
    setPlayers: (state,action:PayloadAction<{ name: string, scramble?: string, cumlativeScore: number}>) => {
        if (!state.playersStats.some((player) => player.name === action.payload.name)) {
          state.playersStats.push(action.payload)
        }
    },
    addLiveFeed: (state, action: PayloadAction<{ user: string, word: string, score: number }>) => {
      state.liveFeed = [
        { ...action.payload, id: Date.now() },
        ...state.liveFeed,
      ].slice(0, 6);
    },
    // all set changes are carried by this
    applyGameState: (state, action: PayloadAction<Partial<GameState>>) => {
      Object.assign(state, action.payload);
    },
    pushToGameRoom: (_state, _action: PayloadAction<ClientMessage>) => { }, // handles all clinet --> server messages sending
  }
})

export const {applyGameState, pushToGameRoom, setPlayers, addLiveFeed} = gameSlice.actions;
export default gameSlice.reducer;
