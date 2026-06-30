
export const Header =()=> {
  return (
    <header className="bg-surface border-b-4 border-deep-ink shadow-[4px_4px_0px_0px_rgba(18,23,33,1)] flex justify-between items-center w-full px-margin-mobile md:px-margin-desktop h-20 z-50 sticky top-0">
      <div className="text-headline-lg font-headline-lg text-primary tracking-tight">Tares</div>
      <div className="flex items-center gap-sm md:gap-lg">
        {/* Global Progress Bar */}
        <div className="hidden md:flex flex-col items-end gap-xs w-48">
          <div className="flex justify-between w-full font-label-bold text-label-bold uppercase">
            <span>Arena Progress</span>
            <span>65%</span>
          </div>
          <div className="w-full h-4 bg-paper-white border-2 border-deep-ink rounded-full overflow-hidden">
            <div className="h-full bg-action-red w-[65%] border-r-2 border-deep-ink"></div>
          </div>
        </div>
        <div className="flex items-center gap-sm">
          <button className="material-symbols-outlined text-primary hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all p-2 bg-sky-blue border-2 border-deep-ink neubrutal-shadow-sm">
            leaderboard
          </button>
          <button className="material-symbols-outlined text-deep-ink hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all p-2 bg-paper-white border-2 border-deep-ink neubrutal-shadow-sm">
            settings
          </button>
        </div>
      </div>
    </header>
  );
}