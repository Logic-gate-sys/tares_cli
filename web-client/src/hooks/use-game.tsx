import type { ClientMessage, ServerMessage, GameRoom } from '#types/messages';
import { create } from 'zustand';
import { usePlayerSocket } from './use-socket';



export type GameState = {
  roomCode?: string; // holds current connected room 
  status: "idle" | "connecting" | "connected" | "waiting_approval" | "playing" | "ended" | "locked" | "error";
  roomPlayers?: unknown[]; // contain player details (e.g stats, name, current position etc)
  rooms?: GameRoom[]; // all rooms available in lobby
  pendingRequests: unknown[];
  message?: ServerMessage; 

  // actions 
  connect: () => void; 
}


export const useGame = create<GameState>((get, set) => ({
  // initial state 
  roomCode: "",
  status: "idle",
  pendingRequests: [],

  // actions that can be taken 
  })); 