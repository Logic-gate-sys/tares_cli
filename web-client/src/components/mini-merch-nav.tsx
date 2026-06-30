export const MiniMerch = () => {
    return (
        <>
          {/* Mini Side Nav Hidden Trigger */}
          <div className="fixed right-margin-desktop bottom-1/2 translate-y-1/2 z-40 hidden md:block">
            <div className="bg-paper-white border-2 border-deep-ink p-sm rounded-lg shadow-[4px_4px_0px_0px_#121721] flex flex-col gap-sm">
              <button className="w-10 h-10 flex items-center justify-center hover:bg-sky-blue transition-colors rounded">
                <span className="material-symbols-outlined text-deep-ink">person</span>
              </button>
              <button className="w-10 h-10 flex items-center justify-center hover:bg-sky-blue transition-colors rounded">
                <span className="material-symbols-outlined text-deep-ink">history</span>
              </button>
              <button className="w-10 h-10 flex items-center justify-center hover:bg-sky-blue transition-colors rounded">
                <span className="material-symbols-outlined text-deep-ink">shopping_cart</span>
              </button>
            </div>
          </div>
        </>
    )
}