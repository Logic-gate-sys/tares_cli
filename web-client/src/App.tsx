import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthGate, NotFound, Home, Lobby, Arena, GameLobbyGate, ArenaGate, HomeLayout } from '#pages/index';
import { Provider } from "react-redux";
import { store } from "#store/store";
import { UIProvider } from "./context/uiContext";
import { GlobalStats } from "#pages/globalStats";

function App() {
  return (
    <BrowserRouter>
      <UIProvider>
        <Provider store={store}>
          <Routes>
            <Route element={<HomeLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/global-stats" element={<GlobalStats/> } />
            </Route>
            <Route element={<AuthGate />}>
              <Route element={<GameLobbyGate />}>
                <Route path="/game/lobby" element={<Lobby />} />
                <Route element={<ArenaGate />} >
                  <Route path="/game/arena" element={<Arena />} />
                </Route>
              </Route>
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Provider>
      </UIProvider>
    </BrowserRouter>
  );
}
export default App;
