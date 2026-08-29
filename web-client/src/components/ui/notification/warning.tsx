export const WarningCard = () => {
  return (
    <div className="fixed z-50 left-0 right-0 bottom-0 top-0 min-h-screen bg-surface flex items-center justify-center">
      <div className="relative bg-paper-white border-[3px] border-deep-ink shadow-[8px_8px_0px_0px_#121721] rounded-DEFAULT animate-scramble">
        <div className="h-12 stripes-warning border-b-[3px] border-deep-ink flex items-center justify-between px-md">
          <div className="w-8 h-8 bg-paper-white border-[2px] border-deep-ink flex items-center justify-center rounded-sm font-headline-md text-headline-md transform -rotate-6 shadow-[2px_2px_0_0_#121721]">!</div>
          <button className="w-8 h-8 bg-paper-white border-[2px] border-deep-ink flex items-center justify-center font-label-bold text-label-bold hover:bg-action-red hover:text-paper-white hover:scale-110 transition-transform active:translate-y-[2px] active:translate-x-[2px] active:shadow-none shadow-[2px_2px_0_0_#121721]">X</button>
        </div>
        <div className="p-lg flex flex-col gap-md">
          <h2 className="font-headline-md text-headline-md uppercase">Invalid Word Selection</h2>
          <p className="font-label-mono text-label-mono text-lg bg-surface-container-high p-md border-[2px] border-deep-ink rounded-DEFAULT">
            ERR_CODE: 0xBADW0RD<br />
            &gt; The sequence attempted does not resolve in the current dictionary lattice. Penalty applied.
          </p>
          <div className="flex justify-end mt-sm">
            <button className="bg-action-red text-paper-white font-label-bold text-label-bold px-lg py-sm border-[3px] border-deep-ink shadow-[4px_4px_0_0_#121721] hover:shadow-[6px_6px_0_0_#121721] hover:-translate-y-px hover:-translate-x-px active:shadow-none active:translate-y-[4px] active:translate-x-[4px] transition-all">RETRY</button>
          </div>
        </div>
        <div className="bg-deep-ink text-paper-white font-label-mono text-label-mono px-md py-sm border-t-[3px] border-deep-ink flex justify-between">
          <span>SYS_LOG: WARN_LVL_3</span>
          <span>14:02:05</span>
        </div>
      </div>
    </div>
  )
}
