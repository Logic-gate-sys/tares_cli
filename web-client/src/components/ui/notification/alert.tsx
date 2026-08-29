export const AlertCard = () => {
  
  return (
  <div className="fixed z-50 left-0 right-0 bottom-0 top-0 min-h-screen bg-surface flex items-center justify-center">
    <div className="relative bg-paper-white border-[3px] border-deep-ink shadow-[8px_8px_0px_0px_#121721] rounded-DEFAULT animate-scramble [animation-delay:0.2s" >
      <div className="h-12 bg-deep-ink flex items-center justify-between px-md">
        <div className="w-8 h-8 bg-paper-white border-[2px] border-deep-ink flex items-center justify-center rounded-sm font-headline-md text-headline-md shadow-[2px_2px_0_0_#BFE6F7]">?</div>
        <button className="w-8 h-8 bg-paper-white border-[2px] border-deep-ink flex items-center justify-center font-label-bold text-label-bold hover:bg-surface-container-highest hover:scale-110 transition-transform active:translate-y-[2px] active:translate-x-[2px] active:shadow-none shadow-[2px_2px_0_0_#BFE6F7]">X</button>
      </div>
      
      <div className="p-lg flex flex-col gap-md">
        <h2 className="font-headline-md text-headline-md uppercase">Daily Challenge Updated</h2>
        <p className="font-label-mono text-label-mono text-lg p-md border-[2px] border-deep-ink border-dashed rounded-DEFAULT">
          &gt; Fetching new grid... OK.<br/>
          &gt; The global rankings have been reset. Good luck.
        </p>
        <div className="flex justify-end mt-sm">
          <button className="bg-paper-white text-deep-ink font-label-bold text-label-bold px-lg py-sm border-[3px] border-deep-ink shadow-[4px_4px_0_0_#121721] hover:shadow-[6px_6px_0_0_#121721] hover:-translate-y-px hover:-translate-x-px active:shadow-none active:translate-y-[4px] active:translate-x-[4px] transition-all">VIEW LADDER</button>
        </div>
      </div>
  
      <div className="bg-surface-variant text-deep-ink font-label-mono text-label-mono px-md py-sm border-t-[3px] border-deep-ink flex justify-between">
        <span>SYS_LOG: INFO_MSG</span>
        <span>00:00:01</span>
      </div>
    </div>
  </div>
    
  )
}