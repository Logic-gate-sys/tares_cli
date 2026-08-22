import { configureStore } from "@reduxjs/toolkit";
import { socketMiddleware } from "./middleware";
import lobbyReducer from "./slices/lobby-slice";
import gameReduer from './slices/ingame-slice'

export const store = configureStore({
  reducer: {
    lobby: lobbyReducer,
    ingame: gameReduer,
  },
  middleware: (middleware) => middleware().concat(socketMiddleware()),
})


export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 