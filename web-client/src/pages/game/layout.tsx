import { Outlet } from "react-router-dom";
import { BottomNav, Header } from "#components/game/arena";

export function Game() {
    return (
        <>  
            <Header/>
            <Outlet />
            <BottomNav />
        </>
    );
}
