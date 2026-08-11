import { Outlet } from "react-router-dom";
import { BottomNav, Header } from "#components/game/arena";
import { AccessDenied } from "#pages/not-authorised";
import { useGame } from "#state/game-context";

export function Game() {
  const { gameState } = useGame();

  console.log("STATUS: ", gameState.conStatus)
  if (gameState.conStatus === "connected") {
    return (<>
      <Header />
      <Outlet />
      <BottomNav />
    </>);
  }

  return (
    <>
      <AccessDenied />
    </>
  )
}
