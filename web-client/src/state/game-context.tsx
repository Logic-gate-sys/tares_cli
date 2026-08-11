import { usePlayerSocket } from "#hooks/use-socket";
import React, { createContext, use, useEffect, useReducer } from "react";
import type { ServerMessage, ClientMessage, GameRoom } from "#types/messages";
import { useAuth } from "./auth-reducer";

export type GameState = {
  roomCode: string; // current room tracking
  rooms?: GameRoom[];
  playerStats?: unknown;
  status: "iddle" | "in-progress" | "ended" | "pending-start"
  round: unknown; // holds round or current round
  currScramble?: string;
  scores: unknown; // track room scores for all players
  event?: ServerMessage;
  conStatus?: "connected" | "disconnected";
}

type GameStateAction =
  | { type: "CONNECT" }
  | { type: "JOIN_ROOM", payload: { name?: string, id: string } }
  | { type: "LEAVE_ROOM", payload: { id: string } }
  | { type: "SEND_WORD", payload: { word: string, roomId: string } }
  | { type: "VIEW_STATS" }
  | { type: "ON_SERVER_MSG", payload: { msg: ServerMessage } }


function gameReducer(state: GameState, action: GameStateAction): GameState {
  switch (action.type) {
    case "JOIN_ROOM":
      return {
        ...state,
        status: "pending-start",
        roomCode: action.payload.id,
      }
    case "LEAVE_ROOM":
      return {
        ...state,
        roomCode: null,
        round: undefined,
        scores: undefined,
      };

    case "CONNECT":
      return {
        ...state,
        conStatus: "connected"
      }
  }
}

// 3. Context Creation
interface GameContextType {
  gameState: GameState;
  send: (msg: ClientMessage) => void;
}
const GameContext = createContext<GameContextType | null>(null);

const initialState: GameState = {
  rooms: null,
  playerStats: null,
  status: "iddle",
  roomCode: null,
  currScramble: "",
  round: undefined,
  scores: undefined,
  conStatus: "disconnected"
}
export function GameContextProvider({ children}: { children: React.ReactNode }) {
  const [gameState, dispatch] = useReducer(gameReducer, { ...initialState });
  const { state } = useAuth(); 
  
  const onMessage = (msg: ServerMessage) => {
    if (gameState.conStatus !== "connected") return;
    dispatch({ type: "ON_SERVER_MSG", payload: { msg } });
  };
  const { connected, send } = usePlayerSocket(onMessage, state?.token);

  useEffect(() => {
    if (connected) {
      console.log("Client connected")
      dispatch({ type: "CONNECT" })
    }
  }, [connected])

  const values: GameContextType = {
    gameState: gameState,
    send
  }
  return <GameContext value={values}> {children} </GameContext>
}


export function useGame() {
  const context = use(GameContext);
  if (!context) {
    console.error("Game context undefined");
    return; 
  }
  
  return context; 
}