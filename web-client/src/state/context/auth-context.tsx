import React, { createContext, useReducer, useEffect } from "react";
import {
    authReducer,
    initialAuthState,
    type AuthState,
    type AuthAction,
} from "../auth-reducer";
import { apiClient } from "#services/api";
import type { SignupRequest, LoginRequest } from "#types/type";

// auth context type
interface AuthContextType {
    state: AuthState;
    dispatch: React.Dispatch<AuthAction>;
    signup: (dt: SignupRequest) => Promise<void>;
    login: (dt: LoginRequest) => Promise<void>;
    logout: () => void;
}

export const AuthContext = createContext<AuthContextType>(
    null as unknown as {
        state: AuthState;
        dispatch: React.Dispatch<AuthAction>;
        signup: (dt: SignupRequest) => Promise<void>;
        login: (dt: LoginRequest) => Promise<void>;
        logout: () => void;
    },
);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [state, dispatch] = useReducer(authReducer, initialAuthState);

    // On mount, restore token from localStorage
    useEffect(() => {
        const savedToken = apiClient.getToken();
        if (savedToken) {
            dispatch({ type: "restore-token", payload: savedToken });
        }
    }, []);

    const signup = async (data: SignupRequest) => {
        dispatch({ type: "start" });
        try {
            const { token, user } = await apiClient.signup(data);
            apiClient.setToken(token);
            dispatch({ type: "success", payload: { token, user: user } });
        } catch (error) {
            dispatch({ type: "error", payload: (error as Error).message });
            throw error;
        }
    };

    const login = async (data: LoginRequest) => {
        dispatch({ type: "start" });
        try {
            const { token, user } = await apiClient.login(data);
            apiClient.setToken(token);
            dispatch({ type: "success", payload: { token, user } });
        } catch (error) {
            dispatch({ type: "error", payload: (error as Error).message });
            throw error;
        }
    };

    const logout = () => {
        apiClient.setToken(null);
        dispatch({ type: "logout" });
    };

    const contextValue: AuthContextType = {
        state,
        dispatch,
        signup,
        login,
        logout,
    };

    return <AuthContext.Provider value={contextValue}> {children} </AuthContext.Provider>;
}
