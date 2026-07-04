// Client → Server
export type ClientMessage =
  | { type: 'game.join'; roomId: string }
  | { type: 'game.wordSubmitted'; word: string }
  | { type: 'game.action'; action: 'PAUSE' | 'RESUME' | 'STOP' }

// Server → Client (broadcasts)
export type ServerMessage =
  | { type: 'connection.established'; playerId: string }
  | { type: 'room.joined'; roomId: string; players: Player[] }
  | { type: 'room.playerJoined'; player: Player }
  | { type: 'room.playerLeft'; playerId: string }
  | { type: 'game.started'; scrambledWord: string; timeLimit: number }
  | { type: 'game.scoreUpdate'; scores: Record<string, number> }
  | { type: 'game.timerTick'; secondsRemaining: number }
  | { type: 'game.ended'; winner: string; finalScores: Record<string, number> }
  | { type: 'error'; message: string }

export interface Player {
  id: string
  email: string
  score: number
}

export interface GameState {
  roomId: string | null
  playerId: string | null
  players: Player[]
  currentWord: string | null
  scrambledWord: string | null
  scores: Record<string, number>
  timeRemaining: number
  gameStatus: 'idle' | 'waiting' | 'playing' | 'ended'
  error: string | null
}