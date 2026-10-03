// All messages format of communication: client ---> go server
// Messages format reflects how communications are supposed to be initiated and carry on
import type { Room, Request } from "./entities"
export type ServerGameState = {
  roomId: string;
  round: number;
  status: "WAITING" | "COUNTDOWN" | "PLAYING" | "ROUND_OVER" | "FINISHED" | "PAUSED";
  timeLeft: number;
  scrambledWord: string;
  scores: Record<string, number>;
  message: string;
};

// Client --> Server Message format
export type ClientMessage =
  | {
    type: `in:lobby`, payload:
    | { action: 'room:create', value: { name: string } } // sends message to socket
    | { action: 'room:update', value: { name: string } }
    | { action: 'request:room:join', value: { roomId?: string } }
    | { action: 'room:join:resolve', value: { requestId: string, accepted: boolean } } // for owner to resolve join request
    | { action: 'room:leave', value: { roomId: string } }
  }
  // in game messages
  | {
    type: 'in:game', payload:
      | { action: 'owner:start:game', value: Record<string, never> }
      | { action: 'PAUSE_GAME' | 'RESUME_GAME', value: Record<string, never> }
      | { action: 'SEND_WORD', value: { word: string } }
  }

// Server --> Client Message format
export type ServerMessage =
  | {
    type: 'in:lobby', payload:
    | { which: 'available:rooms', data: Room[], message?: string }
    | { which: 'rooms:new', data: Room }
    | { which: 'rooms:update', data: Room }
    | { which: 'rooms:join:response', data: { accepted: boolean; room?: Room; message?: string } }
    | { which: 'incoming:join:request', data: Request, message: string } // notification for room owner
    | { which: 'rooms:off-line', data: { id: string } }
  }
  | {
    type: 'in:game', payload:
    | {
      which: 'room:to:joined-client',
      data: ServerGameState, message: string
    }
    | { which: 'room:client:left', data: { name: string, message: string } }
    | { which: 'room:new:client-joined', data: { name: string, message: string } }
    | { which: 'owner:starts:game', data: { timer: number }, message?: string }
  }
