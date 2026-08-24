import { apiClient } from "#services/requests";
import { createContext, use,useEffect, useReducer } from "react";
import type { SignupRequest, LoginRequest, AuthResponse } from "#types/type";



// STATE & ACTION  
export interface AuthState {
  user?: {
    id: string;
    email: string;
    username?: string,
  };
  token?: string | null;
  status: "iddle" | "is-loading" | "error" | "is-authenticated" | "loggedout";
  error: unknown;
}

// login, logout, signup
export type AuthAction =
  | { type: "login" | "signup", payload: { token: string, user: AuthState["user"] } }
  | { type: "logout" }
  | { type: "restore-token", payload: { token: string } }
  | {type : "error", payload:{errorMsg: string}}
  | {type: "start"}


function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case "start": 
      return {
        ...state,
        status: "is-loading"
      }
    case "login":
      if(!action.payload) return state
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        status: "is-authenticated"
      }
    case "signup": 
    if(!action.payload) return state
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        status: "is-authenticated"
      }
    case "logout": 
      return {
        ...state,
        status: "loggedout"
      }
    case "restore-token":
      return {
        ...state,
        token: action.payload.token,
        status: "is-authenticated"
      }
    case "error":
      return {
        ...state,
        error: action.payload.errorMsg
      }
    default:
      return state; 
  }
}

// auth context type
interface AuthContextType {
    state: AuthState;
    dispatch: React.Dispatch<AuthAction>;
    signup: (dt: FormData) => Promise<void>;
    login: (dt: LoginRequest) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType|null>(null);
export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [state, dispatch] = useReducer(authReducer, {user: undefined, error: null, status: 'iddle', token: null});

    // On mount, restore token from localStorage
    useEffect(() => {
        const savedToken = apiClient.getToken();
        if (savedToken) {
            dispatch({ type: "restore-token", payload:{ token: savedToken} });
        }
    }, []);

    const signup = async (data: FormData) => {
        dispatch({ type: "start" });
        try {
          const res = await apiClient.post<FormData>("/users/signup", data);
          if (res.status >= 400) {
            dispatch({ type: "error", payload: { errorMsg: `Failed to signup: status ${res.status}`} });
            return;
          }
          const {token, user} = res.data as AuthResponse; 
          apiClient.setToken(token);
          dispatch({type:"signup", payload: {token, user:{...user}}});
        } catch (error) {
            dispatch({ type: "error", payload:{errorMsg: (error as Error).message} });
        }
    };

    const login = async (data: LoginRequest) => {
        dispatch({ type: "start" });
        try {
          const res = await apiClient.post<LoginRequest>("/users/login", data);
          if (res.status >= 400) {
            dispatch({ type: "error", payload: { errorMsg: `Failed to login: Status ${res.status}` } });
            return; 
          }
          const { token, user } = res.data as AuthResponse; 
          apiClient.setToken(token);
          dispatch({ type: "login", payload: { token, user } });
        } catch (error) {
            dispatch({ type: "error", payload:{errorMsg:(error as Error).message}});
            throw error;
        }
    };

    const logout = () => {
        apiClient.setToken(null);
        dispatch({ type: "logout" });
    };

    const values: AuthContextType = { state, dispatch,signup,login,logout};

   // context
    return <AuthContext value={values}> { children } </AuthContext>;
}



export function useAuth() {
  const context = use(AuthContext);
  if (!context) throw new Error("Auth context not  initialised well")
  return context
}