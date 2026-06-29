export interface AuthState {
    user: { id: string; email:string; username: string } | null;
    token: string | null;
    status: "is-loading" | "error" | "is-authenticated";
    error: unknown; 
}

export type AuthAction =
    | { type: "start" }
    | { type: "success"; payload: { token: string; user: AuthState["user"]}}  
    | { type: "error"; payload: string }
    | { type: "logout" }
    | { type: "restore-token"; payload: string }; // On app load

export const initialAuthState: AuthState = {
    user: null,
    token: null,
    status: 'is-loading',
    error: null
};

export function authReducer(state: AuthState, action: AuthAction): AuthState {
    switch (action.type) {
        case "start":
            return { ...state, status:'is-loading'};

        case "success":
            return {
                ...state,
                token: action.payload.token,
                user: action.payload.user,
                status:'is-authenticated'
            };

        case "error":
            return {
                ...state,
                status: 'error',
                error: action.payload,
            };

        case "logout":
            return { ...initialAuthState };

        case "restore-token":
            // Token was in localStorage, restore it
            return { ...state, token: action.payload, status:'is-authenticated' };

        default:
            return state;
    }
}
