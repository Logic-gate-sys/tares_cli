
export const Loader =  ({progress = 0,loadingText = "Loading...",statusText = "SCRAMBLING_DATA_"}) => {
  // Clamp progress between 0 and 100 to prevent layout overflow
  const clampedProgress = Math.min(Math.max(progress, 0), 100);

  return (
    <div className="absolute z-50 left-0 right-0 bottom-0 top-0 min-h-screen bg-surface flex items-center justify-center">
    <div className="flex flex-col items-center justify-center w-full px-4 max-w-2xl mx-auto">
      {/* Loading Text with Jitter Animation */}
      <div className="font-headline-lg text-headline-lg text-action-red mb-4 uppercase tracking-tighter animate-jitter">
        {loadingText}
      </div>

      {/* Loader Track */}
      <div className="w-full h-12 border-[3px] border-deep-ink bg-sky-blue relative overflow-hidden p-[2px]">
        {/* Background Grid Pattern */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 10px, #121721 10px, #121721 12px)",
          }}
        />

        {/* Dynamic Fill Bar */}
        <div
          className="h-full bg-action-red border-[3px] border-deep-ink relative flex items-center justify-end overflow-hidden transition-all duration-300 ease-out"
          style={{ width: `${clampedProgress}%` }}
        >
          {/* Glitching Leading Edge */}
          <div className="flex h-full border-l-2 border-deep-ink bg-paper-white w-4 shrink-0">
            <div className="w-1/2 h-full bg-deep-ink animate-blink" />
            <div className="w-1/2 h-full bg-action-red animate-blink [animation-delay:0.2s]" />
          </div>
        </div>
      </div>

      {/* Status Indicators */}
      <div className="mt-2 font-label-bold text-label-bold text-deep-ink flex w-full justify-between">
        <span>SYS.INIT</span>
        <span className="animate-pulse">
          {statusText} {Math.round(clampedProgress)}%
        </span>
      </div>

      {/* Embedded Styles for Portability */}
      <style>{`
        @keyframes jitter {
          0% { transform: translate(0, 0); }
          10% { transform: translate(-2px, 2px); }
          20% { transform: translate(2px, -2px); }
          30% { transform: translate(-2px, -2px); }
          40% { transform: translate(2px, 2px); }
          50% { transform: translate(0, 0); }
          100% { transform: translate(0, 0); }
        }
        .animate-jitter {
          animation: jitter 3s infinite steps(2);
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        .animate-blink {
          animation: blink 0.5s infinite step-end;
        }
      `}</style>
      </div>
    </div>
  );
}