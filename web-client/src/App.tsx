import { AuthProvider } from "./state/context/auth-context";
import { AuthGate } from "#components/auth/auth-gate";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Home } from "#pages/home/index";
import { NotFound } from "#pages/not-found";
import { Lobby } from "#pages/game/lobby/game-lobby";
import { Game } from "#pages/game/layout";
import { Arena } from "#pages/game/arena/game-arena";

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route element={<Game/>}>
                        <Route path="/game/lobby" element={<AuthGate> <Lobby /> </AuthGate>} />
                        <Route path="/game/arena" element={<AuthGate> <Arena/> </AuthGate>}/>
                    </Route>
                    <Route path="*" element={<NotFound />}/> 
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
}
export default App;
