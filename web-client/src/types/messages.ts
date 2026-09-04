// All messages format of communication: client ---> go server
// Messages format reflects how communications are supposed to be initiated and carry on
import type { Room } from "./entities"

// client --> server 
export type ClientMessage =
  | { type: `in:lobby`, payload:
    | { action: 'room:create', value: { name: string} } // sends message to socket 
    | { action: 'room:join',   value: { roomId: string } }
    | { action: 'room:leave',  value: { roomId: string } }
  }


// Server → Client (broadcasts)
export type ServerMessage =
  | {
    type: 'in:lobby', payload:
    | { which: 'available:rooms', data: Room[], message?: string }
    | { which: 'rooms:new', data: Room }
    | {which: 'rooms:off-line', data: {id: string}}
  }
  | {
    type: 'in:game', payload:
    | { which: 'score:in', data: unknown }
  }
