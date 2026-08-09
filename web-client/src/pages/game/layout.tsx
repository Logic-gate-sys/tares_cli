import { Outlet } from "react-router-dom";
import { BottomNav, Header } from "#components/game/arena";
import { usePlayerSocket } from "#hooks/use-socket";
import { NotFound } from "#pages/not-found";
import { useAuth } from "#state/auth-reducer";

export function Game() {
  const { state } = useAuth()
  const { connected } = usePlayerSocket(state.token)
  if (connected) {
    return (<>
      <Header />
      <Outlet />
      <BottomNav />
    </>)
  }
  return (
    <>
      <NotFound />
    </>
  )
}
