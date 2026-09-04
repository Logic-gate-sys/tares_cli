
type CardProp = {
  title?: string;
  message: string[];
  onContinue?: () => void;
  onClose: () => void; 
}


export const MessageBox = ({ title, message, onClose, onContinue }: CardProp) => {
  return (
  <div className="fixed z-50 left-0 right-0 bottom-0 top-0 min-h-screen bg-surface flex items-center justify-center">
    <div className="relative bg-paper-white border-[3px] border-deep-ink shadow-[8px_8px_0px_0px_#121721] rounded-DEFAULT animate-scramble [animation-delay:0.1s]" >
    <div className="h-12 grid-success border-b-[3px] border-deep-ink flex items-center justify-between px-md relative overflow-hidden">
      <div className="w-8 h-8 bg-paper-white border-[2px] border-deep-ink flex items-center justify-center rounded-sm font-headline-md text-headline-md transform rotate-6 shadow-[2px_2px_0_0_#121721] text-action-red">W</div>
          <button onClick={onClose }  className="w-8 h-8 bg-paper-white border-[2px] border-deep-ink flex items-center justify-center font-label-bold text-label-bold hover:bg-sky-blue hover:scale-110 transition-transform active:translate-y-[2px] active:translate-x-[2px] active:shadow-none shadow-[2px_2px_0_0_#121721] z-10">X</button>
        </div>
    {/*----------- message ------------------------*/}
    <div className="p-lg flex flex-col gap-md">
          <h2 className="font-headline-md text-headline-md uppercase">{title ? title : "Combo Multiplier Active"}</h2>
      <p className="font-label-mono text-label-mono text-lg bg-surface-container-high p-md border-[2px] border-deep-ink rounded-DEFAULT">
            &gt; {message ? message[0] : "SYNC SUCCESS"}<br/>
            &gt; {message ? message : "5-letter word found. Next word points x2 for 15 seconds."}
      </p>
      <div className="flex justify-end gap-sm mt-sm">
            <button onClick={onContinue} className="bg-sky-blue text-deep-ink font-label-bold text-label-bold px-lg py-sm border-[3px] border-deep-ink shadow-[4px_4px_0_0_#121721] hover:shadow-[6px_6px_0_0_#121721] hover:-translate-y-px hover:-translate-x-px active:shadow-none active:translate-y-[4px] active:translate-x-[4px] transition-all">CONTINUE</button>
      </div>
    </div>
    <div className="bg-deep-ink text-paper-white font-label-mono text-label-mono px-md py-sm border-t-[3px] border-deep-ink flex justify-between">
      <span>SYS_LOG: BUFF_APPLIED</span>
      <span>14:03:12</span>
    </div>
      </div>
  </div>
  )
}