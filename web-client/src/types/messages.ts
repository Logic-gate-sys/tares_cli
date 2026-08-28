// All messages format of communication: client ---> go server
// Messages format reflects how communications are supposed to be initiated and carry on
import type { Room } from "./entities"

export type ClientMessage =
  | {
    type: `in:lobby`, payload:
    | { action: 'room:create', value: FormData }
    | { action: 'room:join', value: { roomId: string } }
    | { action: 'room:leave', value: { roomId: string } }
  }


// Server → Client (broadcasts)
export type ServerMessage =
  | {
    type: 'in:lobby', payload:
    | { which: 'available:rooms', data: unknown, message?: string }
    | { which: 'rooms:available', data: Room[], message?: string }
  }
  | {
    type: 'in:game', payload:
    | { which: 'score:in', data: unknown }
  }
