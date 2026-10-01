// All messages format of communication: client ---> go server
// Messages format reflects how communications are supposed to be initiated and carry on
import type { Room, Request } from "./entities"

// Client --> Server Message format
export type ClientMessage =
  | {type: `in:lobby`, payload:
    | { action: 'room:create', value: { name: string } } // sends message to socket
    | { action: 'room:update', value: { name: string } }
    | { action: 'request:room:join', value: { roomId?: string } }
    | { action: 'room:join:resolve', value: { requestId: string, accepted: boolean } } // for owner to resolve join request
    | { action: 'room:leave', value: { roomId: string } }
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
    | { which: 'score:in', data: unknown }
  }
