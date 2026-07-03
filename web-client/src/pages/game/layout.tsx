import { Outlet } from "react-router-dom";
import { BottomNav, Header } from "#components/game/arena";
import { usePlayerSocket } from "#hooks/use-socket";
import { NotFound } from "#pages/not-found";

export function Game() {
  const {connected, events } = usePlayerSocket()
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
