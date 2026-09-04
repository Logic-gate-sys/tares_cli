import { AuthProvider } from "#store/auth-reducer";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthGate, NotFound, Home, Lobby, Game, HomeLayout } from '#pages/index';
import { Provider } from "react-redux";
import { store } from "#store/store";
import { UIProvider } from "./context/ui-context";

function App() {
  return (
    <BrowserRouter>
      <UIProvider>
      <AuthProvider>
        <Provider store={store}>
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
        </Provider>
        </AuthProvider>
      </UIProvider>
    </BrowserRouter>
  );
}
export default App;
