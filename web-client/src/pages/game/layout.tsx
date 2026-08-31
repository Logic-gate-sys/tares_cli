import { Outlet } from "react-router-dom";
import { BottomNav, Header } from "#components/game/arena";
import { AccessDenied } from "#pages/not-authorised";
import { useSelector } from "react-redux";
import type { RootState } from "src/store/store";

export function Game() {
  const { socketStatus } = useSelector((state: RootState) => state.lobby)
  if (socketStatus && socketStatus === "connected") {
    return (
      <>
        <Header />
        <div className="m-auto p-20 ">
          <Outlet />
        </div>
        <BottomNav />
      </>);
  }

  return (<><AccessDenied /></>)
}
