export interface GameState {
    status: "iddle"|"in-lobby"|"in-game"|"completed-round"|"error"|"left-lobby"|"left-arena";
    error: unknown; 
}

export type GameAction =
    | { type: "join-lobby" }
    | { type: "join-arena"; }  
    | { type: "error"; }
    | { type: "leave-arena" }
    | { type: "leave-lobby";}; // On app load

export const initialGameState: GameState = {
    status: 'iddle',
    error: null
};

export function gameReducer(state: GameState, action: GameAction): GameState {
    switch (action.type) {
        case "join-lobby":
            return { ...state, status:'in-lobby'};

        case "leave-lobby":
            return {
                ...state,
                status:'left-lobby'
            };

        case "join-arena":
            return {
                ...state,
                status:'in-game',
            };

        case "leave-arena":
            return { ...state, status:'left-arena' };

        case "error":
            // Token was in localStorage, restore it
            return { ...state, status:'error'};

        default:
            return state;
    }
}
