import React, { createContext, useReducer } from "react";
import { gameReducer, initialGameState, type GameAction, type GameState } from "#state/game-reducer";


// auth context type
interface GameContextType {
    state: GameState;
    dispatch: React.Dispatch<GameAction>
}

export const GameContext = createContext<GameContextType>(
    null as unknown as {
        state: GameState;
        dispatch: React.Dispatch<GameAction>;
    },
);

export function GameProvider({ children }: { children: React.ReactNode }) {
    const [state, dispatch] = useReducer(gameReducer, initialGameState);
    const contextValue: GameContextType = {
        state,
        dispatch,
      
    };

    return <AuthContext.Provider value={contextValue}> {children} </AuthContext.Provider>;
}
