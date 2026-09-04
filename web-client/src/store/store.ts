import { configureStore } from "@reduxjs/toolkit";
import { socketMiddleware } from "./middleware";
import lobbyReducer from "./slices/lobby-slice";
import gameReduer from './slices/ingame-slice'
import { baseApi } from "./services/api-slice";
import authSlice  from "./slices/auth-slice";


export const store = configureStore({
  reducer: {
    auth: authSlice,
    lobby: lobbyReducer,
    ingame: gameReduer,
    [baseApi.reducerPath]: baseApi.reducer,
  },
  middleware: (middleware) => middleware().concat(baseApi.middleware, socketMiddleware()),
})


export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 