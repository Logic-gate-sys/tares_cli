import { NavLink } from "react-router-dom";

export const BottomNav = () => {
  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center h-20 px-4 pb-safe bg-sky-blue border-t-4 border-deep-ink shadow-[0px_-4px_0px_0px_rgba(18,23,33,1)]">
      <NavLink className="flex flex-col items-center justify-center text-deep-ink p-2 hover:bg-secondary-container transition-colors active:scale-95" to="/">
        <span className="material-symbols-outlined">home</span>
        <span className="text-label-bold font-label-bold">Home</span>
      </NavLink>
      <NavLink className="flex flex-col items-center justify-center text-deep-ink p-2 hover:bg-secondary-container transition-colors active:scale-95" to="/game/lobby">
        <span className="material-symbols-outlined">group</span>
        <span className="text-label-bold font-label-bold">Lobby</span>
      </NavLink>
      <NavLink className="flex flex-col items-center justify-center bg-action-red text-paper-white border-2 border-deep-ink rounded-lg px-4 py-1 translate-y-[-4px] shadow-[4px_4px_0px_0px_rgba(18,23,33,1)] active:scale-95 transition-transform" to="/game/arena">
        <span className="material-symbols-outlined">videogame_asset</span>
        <span className="text-label-bold font-label-bold">Play</span>
      </NavLink>
      <NavLink className="flex flex-col items-center justify-center text-deep-ink p-2 hover:bg-secondary-container transition-colors active:scale-95" to="/game/stats">
        <span className="material-symbols-outlined">trophy</span>
        <span className="text-label-bold font-label-bold">Stats</span>
      </NavLink>
    </nav>
  );
}