import { AuthProvider } from "#state/auth-reducer";
import { AuthGate } from "#pages/auth-gate";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Home } from "#pages/home/index";
import { NotFound } from "#pages/not-found";
import { Lobby } from "#pages/game/lobby/game-lobby";
import { Game } from "#pages/game/layout";
import HomeLayout from "#pages/home/layout";
import { GameContextProvider } from "#state/game-context";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <GameContextProvider>
          <Routes>
            <Route element={<HomeLayout />}>
              <Route path="/" element={<Home />} />
            </Route>
            <Route element={<AuthGate />}>
              <Route element={<Game />}>
                <Route path="/game/lobby" element={<Lobby />} />
                <Route path="/game/arena" element={<Lobby />} />
              </Route>
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </GameContextProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
export default App;
