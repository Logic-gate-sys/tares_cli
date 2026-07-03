import { Outlet } from "react-router-dom";
import { BottomNav, Header } from "#components/game/arena";
import { usePlayerSocket } from "#hooks/use-socket";
import { NotFound } from "#pages/not-found";
import { useAuth } from "#hooks/use-auth";

export function Game() {
  const { state } = useAuth()
  const {connected, events } = usePlayerSocket(state.token)
  if (connected) {
    return (<>
      {events.type ==="room.joined" && (<Header />)}
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
