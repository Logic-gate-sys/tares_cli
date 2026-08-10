import { Outlet } from "react-router-dom";
import { BottomNav, Header } from "#components/game/arena";
import { usePlayerSocket } from "#hooks/use-socket";
import { useAuth } from "#state/auth-reducer";
import { AccessDenied } from "#pages/not-authorised";

export function Game() {
  const { state } = useAuth();
  const {connected } = usePlayerSocket(state.token)
  if (connected) {
    return (<>
      <Header />
        <Outlet />
      <BottomNav />
    </>)
  }
  // Not connected should return not authorised page
  return (
    <>
      <AccessDenied />
    </>
  )
}
