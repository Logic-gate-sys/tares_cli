// All messages format of communication: client ---> go server
// Messages format reflects how communications are supposed to be initiated and carry on

export type ClientMessage =
  | {
    type: `in:lobby`, payload:
      | { action: 'lobby:room:create', value: { name: string; capacity: number; } }
      | { action: 'lobby:room:join', value: { roomId: string } }
      | { action: 'lobby:room:leave', value: { roomId: string } }
  }


// Server → Client (broadcasts)
export type ServerMessage =
  | {
    type: 'in:lobby', payload:
      | { which: 'rooms:available', data: Room[], message?: string }
  }
  | {
    type: 'in:game', payload: 
    |{which:'score:in', data: unknown}}



export type Room = {
  id: string;
  status: string;
  name: string;
  capacity: number;
}
