import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { AuthResponse, ErrorResponse } from "#types/type";
import { authApi } from "#store/services/authExtend";



export interface AuthState {
  user?: {
    id: number;
    email: string;
    username?: string;
    p_level?: string;
    bio?: string;
    wins: number;
    rank: string;
    accuracy: number;
    total_score?: number;
    createdAt: string | Date;
  };
  token?: string | null;
  status: "idle" | "is-loading" | "error" | "is-authenticated" | "loggedout";
  message?: string | null;
  progress: 0 | 35 | 65 | 100;
  error?: string | null
}

const initialState: AuthState = {
  error: null,
  status: 'idle',
  progress:0,
}

function getAuthError(error: unknown): string {
  if (typeof error === "string") return error;

  if (error && typeof error === "object") {
    if ("data" in error) {
      const data = (error as { data?: ErrorResponse | string }).data;
      if (typeof data === "string") return data;
      if (data?.error) return data.error;
      if (data?.details && Array.isArray(data.details)) {
        return data.details
          .map((detail) => {
            if (detail && typeof detail === "object" && "message" in detail) {
              return String(detail.message);
            }
            return String(detail);
          })
          .join(". ");
      }
    }

    if ("error" in error) {
      const message = (error as { error?: unknown }).error;
      if (typeof message === "string") return message;
    }
  }

  return "Authentication request failed";
}


export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setToken: (state, action: PayloadAction<string | null>) => {
      state.token = action.payload;
      if (!action.payload) {
        state.user = undefined;
        state.status = "loggedout";
      }
    },
    setCredentials: (state, action: PayloadAction<AuthResponse>) => {
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.status = "is-authenticated";
      state.error = null;
      state.progress = 100;
    },
    logout: (state) => {
      state.token = null;
      state.user = undefined;
      state.status = "loggedout";
      state.message = null;
      state.error = null;
      state.progress = 100;
    },
    clearAuthMessage: (state) => {
      state.message = null;
      state.error = null;
      if (state.status === "error") state.status = "idle";
    },
  },

  // extraReducers
  extraReducers: (builder) => {
    builder
      .addMatcher(
        authApi.endpoints.signUp.matchPending,
        (state) => {
          state.status = "is-loading";
          state.progress = 35;
          state.message = null;
          state.error = null;
        },
      )
      .addMatcher(
        authApi.endpoints.signIn.matchPending,
        (state) => {
          state.status = "is-loading";
          state.progress = 35;
          state.message = null;
          state.error = null;
        },
      )
      .addMatcher(
        authApi.endpoints.signUp.matchFulfilled,
        (state, action: PayloadAction<AuthResponse>) => {
          const {user, token, error } = action.payload; 
          state.token = token;
          state.user = user;
          state.status = "is-authenticated";
          state.progress = 100;
          state.message = "Sign up successful!, please login";
          state.error = error as string;
        },
      )
      .addMatcher(
        authApi.endpoints.signIn.matchFulfilled,
        (state, action: PayloadAction<AuthResponse>) => {
          const { user, error, token } = action.payload;
          state.token = token;
          state.user =  user;
          state.status = "is-authenticated";
          state.progress = 100;
          state.message = 'Sign in successful!!';
          state.error = error as string ;
        },
      )
      .addMatcher(
        authApi.endpoints.signUp.matchRejected, (state, action) => {
          state.status = "error";
          state.progress = 100;
          state.error = getAuthError(action.payload ?? action.error);
        },
      )
      .addMatcher(
        authApi.endpoints.signIn.matchRejected,
        (state, action) => {
          state.status = "error";
          state.progress = 100;
          state.error = getAuthError(action.payload ?? action.error);
        },
      );
  },
});

export const { setToken, setCredentials, logout, clearAuthMessage } = authSlice.actions;
export default authSlice.reducer;
