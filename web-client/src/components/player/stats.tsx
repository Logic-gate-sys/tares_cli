export  function PlayerStats() {
  return (
    <aside className="md:col-span-3 space-y-md">
      {/* Current Stats */}
      <div className="bg-paper-white border-4 border-deep-ink neubrutal-shadow">
        <div className="bg-deep-ink p-sm text-paper-white flex justify-between items-center">
          <span className="font-label-bold text-label-bold">PLAYER STATS</span>
          <span className="material-symbols-outlined text-[18px]">person</span>
        </div>
        <div className="p-md space-y-sm">
          <div className="flex justify-between border-b-2 border-deep-ink/10 pb-xs">
            <span className="text-label-mono font-label-mono uppercase opacity-60">Score</span>
            <span className="font-headline-md text-xl">12,450</span>
          </div>
          <div className="flex justify-between border-b-2 border-deep-ink/10 pb-xs">
            <span className="text-label-mono font-label-mono uppercase opacity-60">Rank</span>
            <span className="font-headline-md text-xl text-primary">#14</span>
          </div>
          <div className="flex justify-between">
            <span className="text-label-mono font-label-mono uppercase opacity-60">Words</span>
            <span className="font-headline-md text-xl">18/25</span>
          </div>
        </div>
      </div>

      {/* Badge Bento */}
      <div className="grid grid-cols-2 gap-sm">
        <div className="bg-surface-container border-2 border-deep-ink p-sm flex flex-col items-center justify-center text-center neubrutal-shadow-sm">
          <span className="material-symbols-outlined text-primary mb-xs">local_fire_department</span>
          <span className="text-[10px] font-label-bold uppercase">On Fire</span>
        </div>
        <div className="bg-secondary-container border-2 border-deep-ink p-sm flex flex-col items-center justify-center text-center neubrutal-shadow-sm">
          <span className="material-symbols-outlined text-deep-ink mb-xs">verified</span>
          <span className="text-[10px] font-label-bold uppercase">Pro Tier</span>
        </div>
      </div>

      {/* Global Activity Image Section */}
      <div className="relative group mt-xl">
        <div className="absolute inset-0 bg-deep-ink neubrutal-shadow"></div>
        <img
          alt="TARES Branded T-Shirt"
          className="relative border-4 border-deep-ink w-full grayscale hover:grayscale-0 transition-all cursor-crosshair"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuDonrzhXu_9N5WXw6pInbYtHnvFfDa2oetwa9nKFbHA6SXHdSpjC-NMu0jjT05P5Ve39UsfXVSf7f7vTGZM9IHHoHNYzpavvo-Oj92sx2SyRpLnYux-f-hP9a6fK20tVR_FsEPO1U3_2NCik1_OSCoKMCt2ceACUVfPVOdpXetZ85nbZijTM1l9KqqFVWOs0ke4BHAQPxEOVEIJh1WQObojxx6a3Eez5rBlNeU_I6vTgitsi5FnCO8LkKsr0yF7_RAewGl6w0xuKfK_"
        />
        <div className="absolute bottom-4 left-4 bg-paper-white border-2 border-deep-ink px-sm py-xs font-label-mono text-[10px] uppercase">
          Arena #2026 Active
        </div>
      </div>
    </aside>
  );
}