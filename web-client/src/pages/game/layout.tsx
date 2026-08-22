import { Outlet } from "react-router-dom";
import { BottomNav, Header } from "#components/game/arena";
import { AccessDenied } from "#pages/not-authorised";
import { useSelector } from "react-redux";
import type { RootState } from "#state/store";

export function Game() {
  const { socketStatus } = useSelector((state: RootState) => state.lobby)
  if (socketStatus === "connected") {
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
