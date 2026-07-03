import { useState} from 'react';
import { Link } from 'react-router-dom';

const SCRAMBLED_LETTERS = ['O', 'N', 'F', 'U', 'T', 'D', 'O', 'N'];

export  function NotFound() {
  const [wigglingIndex, setWigglingIndex] = useState<number | null>(null);

  // React-based micro-interaction for the random wiggling tiles
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * SCRAMBLED_LETTERS.length);
      setWigglingIndex(randomIndex);
      
      setTimeout(() => {
        setWigglingIndex(null);
      }, 150);
    }, 800);
    clearInterval(interval)
  return (
    <div className="bg-surface text-on-surface font-body-md min-h-screen overflow-x-hidden">
      <style dangerouslySetInnerHTML={{
        __html: `
        .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
        .floating {
            animation: floating 3s ease-in-out infinite;
        }
        @keyframes floating {
            0% { transform: translate(0, 0px) rotate(0deg); }
            50% { transform: translate(0, -15px) rotate(3deg); }
            100% { transform: translate(0, 0px) rotate(0deg); }
        }
        .sticker {
            filter: drop-shadow(4px 4px 0px #121721);
        }
      `}} />

      {/* Background Elements (Floating Letters & Stickers) */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-20">
        <div className="absolute top-[20%] left-[10%] floating" style={{ animationDelay: '0s' }}>
          <div className="w-16 h-16 bg-paper-white border-2 border-deep-ink rounded-lg flex items-center justify-center text-headline-md font-headline-md shadow-[4px_4px_0px_0px_#121721] -rotate-12">A</div>
        </div>
        <div className="absolute top-[15%] right-[15%] floating" style={{ animationDelay: '1.5s' }}>
          <div className="w-12 h-12 bg-sky-blue border-2 border-deep-ink rounded-lg flex items-center justify-center text-headline-md font-headline-md shadow-[4px_4px_0px_0px_#121721] rotate-6">Q</div>
        </div>
        <div className="absolute bottom-[30%] left-[5%] floating" style={{ animationDelay: '0.5s' }}>
          <span className="material-symbols-outlined text-action-red text-[80px] sticker">bolt</span>
        </div>
        <div className="absolute top-[60%] right-[8%] floating" style={{ animationDelay: '2s' }}>
          <span className="material-symbols-outlined text-sky-blue text-[100px] sticker">trophy</span>
        </div>
        <div className="absolute bottom-[10%] left-[20%] floating" style={{ animationDelay: '1s' }}>
          <div className="w-20 h-20 bg-action-red border-2 border-deep-ink rounded-lg flex items-center justify-center text-paper-white text-headline-md font-headline-md shadow-[4px_4px_0px_0px_#121721] rotate-12">Z</div>
        </div>
      </div>

      {/* Main Content */}
      <main className="relative z-10 pt-32 pb-40 px-margin-mobile flex flex-col items-center justify-center min-h-screen text-center">
        
        {/* Scrambled 404 */}
        <div className="flex gap-4 mb-8 scale-75 md:scale-100">
          <div className="w-24 h-24 md:w-32 md:h-32 bg-action-red border-4 border-deep-ink rounded-lg flex items-center justify-center text-[64px] md:text-[80px] font-headline-md text-paper-white shadow-[8px_8px_0px_0px_#121721] -rotate-6 hover:bg-deep-ink transition-colors cursor-default">4</div>
          <div className="w-24 h-24 md:w-32 md:h-32 bg-action-red border-4 border-deep-ink rounded-lg flex items-center justify-center text-[64px] md:text-[80px] font-headline-md text-paper-white shadow-[8px_8px_0px_0px_#121721] rotate-3 translate-y-4 hover:bg-deep-ink transition-colors cursor-default">0</div>
          <div className="w-24 h-24 md:w-32 md:h-32 bg-action-red border-4 border-deep-ink rounded-lg flex items-center justify-center text-[64px] md:text-[80px] font-headline-md text-paper-white shadow-[8px_8px_0px_0px_#121721] rotate-12 -translate-y-2 hover:bg-deep-ink transition-colors cursor-default">4</div>
        </div>

        <h1 className="text-display-lg-mobile md:text-display-lg font-display-lg text-deep-ink mb-4 max-w-4xl tracking-tight leading-none uppercase">
          LOST IN THE <span className="text-action-red">SCRAMBLE?</span>
        </h1>
        <p className="text-body-lg md:text-headline-md font-body-lg text-secondary mb-12 max-w-2xl">
          The page you're looking for has been shuffled out of existence.
        </p>

        {/* Mini-Scramble Box */}
        <div className=" bg-sky-blue border-4 border-deep-ink p-lg rounded-xl shadow-[8px_8px_0px_0px_#121721] mb-12 ">
          <div className="flex justify-between items-center mb-md border-b-2 border-deep-ink pb-xs">
            <span className="text-label-bold font-label-bold text-deep-ink uppercase tracking-widest">Puzzle #404</span>
            <span className="material-symbols-outlined text-deep-ink">refresh</span>
          </div>
          <div className="grid grid-cols-4 gap-sm">
            {SCRAMBLED_LETTERS.map((letter, idx) => {
              // Calculate a random rotation only when the index matches to mimic the original vanilla JS logic
              const randomRotation = wigglingIndex === idx ? (Math.random() - 0.5) * 20 : 0;
              const isWiggling = wigglingIndex === idx;

              return (
                <div
                  key={idx}
                  className="w-full aspect-square bg-paper-white border-2 border-deep-ink rounded-lg flex items-center justify-center text-headline-md font-headline-md text-deep-ink shadow-[4px_4px_0px_0px_#121721]"
                  style={{
                    transition: 'transform 0.15s ease-out',
                    transform: isWiggling ? `rotate(${randomRotation}deg) scale(1.1)` : 'rotate(0deg) scale(1)'
                  }}
                >
                  {letter}
                </div>
              );
            })}
          </div>
        </div>

        <Link className="group inline-flex items-center gap-md bg-action-red text-paper-white font-headline-md px-xl py-lg rounded-xl border-4 border-deep-ink shadow-[8px_8px_0px_0px_#121721] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[6px_6px_0px_0px_#121721] active:translate-x-[8px] active:translate-y-[8px] active:shadow-none transition-all uppercase tracking-tight" to="/">
          BACK TO MY ROOT
          <span className="material-symbols-outlined text-headline-md transition-transform group-hover:translate-x-1">arrow_forward</span>
        </Link>
      </main>

      {/* BottomNavBar (Mobile Only) */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center h-20 px-4 pb-safe bg-sky-blue border-t-4 border-deep-ink shadow-[0px_-4px_0px_0px_#121721]">
        <button className="flex flex-col items-center justify-center text-deep-ink p-2 hover:bg-secondary-container transition-colors">
          <span className="material-symbols-outlined">home</span>
          <span className="text-label-bold font-label-bold">Home</span>
        </button>
        <button className="flex flex-col items-center justify-center text-deep-ink p-2 hover:bg-secondary-container transition-colors">
          <span className="material-symbols-outlined">group</span>
          <span className="text-label-bold font-label-bold">Lobby</span>
        </button>
        <button className="flex flex-col items-center justify-center text-deep-ink p-2 hover:bg-secondary-container transition-colors">
          <span className="material-symbols-outlined">videogame_asset</span>
          <span className="text-label-bold font-label-bold">Play</span>
        </button>
        <button className="flex flex-col items-center justify-center text-deep-ink p-2 hover:bg-secondary-container transition-colors">
          <span className="material-symbols-outlined">trophy</span>
          <span className="text-label-bold font-label-bold">Stats</span>
        </button>
      </nav>

     
    </div>
  );
}