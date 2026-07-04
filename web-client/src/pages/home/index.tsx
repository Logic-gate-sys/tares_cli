import React, { useState, useRef } from 'react';
import { Bolt, Trophy,Star, ChartNoAxesColumn, Gauge, ShieldAlert } from 'lucide-react';
import { NavigationBar} from '#components/home/navigation-bar'
import { Hero } from '#components/home/hero';
import { Footer } from '#components/footer';

export  function Home() {
  const [guess, setGuess] = useState('');
  const [activeAnims, setActiveAnims] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Ghost letter typing animation hook
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key.length > 1 && e.key !== ' ') || !inputRef.current) return;

    const char = e.key;
    const rect = inputRef.current.getBoundingClientRect();

    // Create custom floating ghost element
    const ghost = document.createElement('div');
    ghost.textContent = char;

    // Core layout styles
    ghost.style.position = 'fixed';
    ghost.style.pointerEvents = 'none';
    ghost.style.zIndex = '1000';
    ghost.style.fontFamily = '"Bricolage Grotesque", sans-serif';
    ghost.style.fontWeight = '800';
    ghost.style.color = '#121721';
    ghost.style.textShadow = '2px 2px 0px rgba(18, 23, 33, 0.2)';
    ghost.style.fontSize = '24px';
    ghost.style.transition = 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
    ghost.style.textTransform = 'uppercase';

    // Spawn point: bottom window threshold
    const startX = Math.random() * window.innerWidth;
    const startY = window.innerHeight + 50;
    ghost.style.left = `${startX}px`;
    ghost.style.top = `${startY}px`;
    ghost.style.transform = `rotate(${Math.random() * 360}deg) scale(2.5)`;

    document.body.appendChild(ghost);

    // Grid tracking coordinates for placement alignment
    const charWidth = 13;
    const paddingLeft = 16;
    const currentLength = guess.length;
    const targetX = rect.left + paddingLeft + currentLength * charWidth;
    const targetY = rect.top + rect.height / 2 - 14;

    setActiveAnims((prev) => prev + 1);

    requestAnimationFrame(() => {
      ghost.style.left = `${targetX}px`;
      ghost.style.top = `${targetY}px`;
      ghost.style.transform = 'rotate(0deg) scale(1)';

      setTimeout(() => {
        ghost.style.opacity = '0';
        setActiveAnims((prev) => {
          const next = prev - 1;
          return next < 0 ? 0 : next;
        });
        setTimeout(() => ghost.remove(), 100);
      }, 400);
    });
  };

  return (
    <div className="bg-[#f9f9ff] text-[#121721] font-sans overflow-x-hidden min-h-screen flex flex-col">
      {/* GLOBAL NEUBRUTAL STYLES INJECTOR */}
      <style>{`
        @keyframes float {
          0% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
          100% { transform: translateY(0px) rotate(0deg); }
        }
        @keyframes float-fast {
          0%, 100% { transform: translateY(0) rotate(-5deg); }
          50% { transform: translateY(-15px) rotate(10deg); }
        }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-float-fast { animation: float-fast 4s ease-in-out infinite; }
        .animate-marquee { animation: marquee 20s linear infinite; }
        .neubrutal-shadow { box-shadow: 4px 4px 0px 0px #121721; }
        .neubrutal-shadow-lg { box-shadow: 8px 8px 0px 0px #121721; }
        .neubrutal-shadow-xl { box-shadow: 12px 12px 0px 0px #121721; }
      `}</style>

      {/* DECORATIVE STICKERS */}
      <div className="absolute top-20 left-[5%] rotate-[-15deg] hidden lg:block z-10 filter drop-shadow-[4px_4px_0px_#121721] animate-float-fast">
        <div className="bg-[#BFE6F7] border-4 border-[#121721] p-4 flex items-center justify-center">
          <Bolt className="w-8 h-8 fill-current text-[#121721]" />
        </div>
      </div>
      <div
        className="absolute bottom-40 left-[10%] rotate-[10deg] hidden lg:block z-10 filter drop-shadow-[4px_4px_0px_#121721] animate-float-fast"
        style={{ animationDelay: '-1s' }}
      >
        <div className="bg-[#EC2513] text-white border-4 border-[#121721] p-4 flex items-center justify-center">
          <Trophy className="w-8 h-8 fill-current text-white" />
        </div>
      </div>
      <Hero/>

      {/* MARQUEE TICKER */}
      <div className="w-full bg-[#121721] py-5 border-y-4 border-[#121721] overflow-hidden whitespace-nowrap z-30 relative">
        <div className="flex w-max animate-marquee">
          {[1, 2, 3, 4].map((_, idx) => (
            <React.Fragment key={idx}>
              <span className="text-white font-mono font-bold text-sm px-10 uppercase flex items-center gap-3">
                <Star className="text-[#EC2513] w-4 h-4 fill-current" /> WINNER: @WordWizard unscrambled 'QUARTZ' in 1.2s
              </span>
              <span className="text-white font-mono font-bold text-sm px-10 uppercase flex items-center gap-3">
                <Star className="text-[#BFE6F7] w-4 h-4 fill-current" /> WINNER: @LexiconKing unscrambled 'PHARAOH' in 2.5s
              </span>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* GAME FEATURES SECTION */}
      <section className="py-12 px-4 md:px-10 bg-[#f1f3ff] border-b-4 border-[#121721]">
        <div className="max-w-7xl mx-auto">
          <div className="mb-20 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h2 className="text-4xl font-bold uppercase mb-4">Game Features</h2>
              <p className="text-xl text-[#3e6372] font-medium">Why thousands are losing their minds (and loving it).</p>
            </div>
            <div className="flex gap-4">
              <div className="w-16 h-16 bg-[#EC2513] border-4 border-[#121721] neubrutal-shadow flex items-center justify-center">
                <Bolt className="w-8 h-8 text-white fill-current" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Card 1 */}
            <div className="group bg-white border-4 border-[#121721] p-10 neubrutal-shadow-lg transition-all hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[12px_12px_0px_0px_#121721]">
              <div className="w-20 h-20 bg-[#EC2513] border-4 border-[#121721] mb-8 flex items-center justify-center -rotate-6 group-hover:rotate-0 transition-transform">
                <Gauge  className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-2xl font-bold uppercase mb-6">Real-time Scramble</h3>
              <p className="text-base mb-8">Battle up to 99 other players simultaneously. First to find the word wins the round. Last standing wins the glory.</p>
              <div className="h-4 w-full bg-gray-200 border-4 border-[#121721]">
                <div className="h-full bg-[#EC2513] w-3/4"></div>
              </div>
            </div>

            {/* Card 2 */}
            <div className="group bg-[#BFE6F7] border-4 border-[#121721] p-10 neubrutal-shadow-lg transition-all hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[12px_12px_0px_0px_#121721]">
              <div className="w-20 h-20 bg-[#121721] border-4 border-[#121721] mb-8 flex items-center justify-center rotate-3 group-hover:rotate-0 transition-transform">
                <ChartNoAxesColumn className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-2xl font-bold uppercase mb-6">Global Rankings</h3>
              <p className="text-base mb-8">Earn points, unlock trophies, and see where you rank against the best word-slingers across the planet.</p>
              <div className="flex -space-x-4">
                <div className="w-12 h-12 rounded-full border-4 border-[#121721] bg-[#EC2513] flex items-center justify-center text-white font-bold text-xl">1</div>
                <div className="w-12 h-12 rounded-full border-4 border-[#121721] bg-white flex items-center justify-center font-bold text-xl">2</div>
              </div>
            </div>

            {/* Card 3 */}
            <div className="group bg-white border-4 border-[#121721] p-10 neubrutal-shadow-lg transition-all hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[12px_12px_0px_0px_#121721]">
              <div className="w-20 h-20 bg-[#EC2513] border-4 border-[#121721] mb-8 flex items-center justify-center rotate-12 group-hover:rotate-0 transition-transform">
                <ShieldAlert className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-2xl font-bold uppercase mb-6">Daily Challenges</h3>
              <p className="text-base mb-8">Every day a new puzzle. Beat the global average to win exclusive limited-edition stickers and badge skins.</p>
              <div className="inline-flex items-center gap-2 bg-[#121721] text-white px-4 py-2 font-mono font-bold text-xs uppercase">
                Ends in: 14:22:01
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* LIVE DEMO ARENA MATCH SECTION */}
      <section className="py-12 px-4 md:px-10 bg-white overflow-hidden">
        <div className="max-w-4xl mx-auto border-[6px] border-[#121721] bg-[#BFE6F7] p-8 md:p-12 neubrutal-shadow-xl relative">
          <div className="absolute -top-6 left-6 bg-[#121721] text-white border-4 border-[#121721] px-4 py-1 font-mono font-bold uppercase tracking-wider text-sm">
            Live Demo Match
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            <div className="md:col-span-2 flex flex-col justify-between bg-white border-4 border-[#121721] p-6 relative">
              <div>
                <div className="flex justify-between items-center mb-6">
                  <span className="font-mono text-xs text-[#3e6372] uppercase bg-gray-100 px-2 py-1 border-2 border-[#121721]">Round 4/10</span>
                  <span className="font-mono text-xs text-[#EC2513] font-bold">Time Left: 14.8s</span>
                </div>

                <div className="text-center my-8">
                  <p className="font-mono text-xs text-[#3e6372] uppercase tracking-widest mb-2">Unscramble This Word:</p>
                  <div className="flex justify-center gap-2 flex-wrap">
                    {['T', 'A', 'R', 'E', 'S'].map((letter, i) => (
                      <span key={i} className="w-12 h-12 bg-[#f9f9ff] border-4 border-[#121721] flex items-center justify-center text-2xl font-bold neubrutal-shadow">{letter}</span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <label className="block font-mono font-bold text-sm uppercase">Your Guess:</label>
                <input
                  ref={inputRef}
                  type="text"
                  value={guess}
                  onChange={(e) => setGuess(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="TYPE YOUR GUESS..."
                  className={`w-full bg-[#f9f9ff] border-4 border-[#121721] p-4 font-mono font-bold outline-none uppercase placeholder:text-zinc-400 focus:border-[#EC2513] transition-colors text-xl ${
                    activeAnims > 0 ? 'text-transparent select-none' : 'text-[#121721]'
                  }`}
                />
                <button className="w-full bg-[#EC2513] text-white font-bold py-4 border-4 border-[#121721] neubrutal-shadow active:translate-x-1 active:translate-y-1 active:shadow-none uppercase tracking-wider text-lg">
                  Submit Word
                </button>
              </div>
            </div>

            <div className="bg-[#121721] text-white border-4 border-[#121721] p-6 flex flex-col justify-between">
              <div>
                <h4 className="text-lg font-bold uppercase tracking-wide border-b-2 border-white/20 pb-2 mb-4 text-[#BFE6F7]">Live Feed</h4>
                <ul className="space-y-3 font-mono text-xs">
                  <li className="flex justify-between items-center bg-white/5 p-2 border border-white/10">
                    <span className="text-[#EC2513] font-bold">1st</span> <span>@WordWizard</span> <span className="bg-[#EC2513] text-white px-1">1.2s</span>
                  </li>
                  <li className="flex justify-between items-center p-2">
                    <span className="opacity-60">2nd</span> <span className="opacity-80">@LexiconKing</span> <span className="opacity-60">2.5s</span>
                  </li>
                  <li className="flex justify-between items-center p-2 animate-pulse text-[#BFE6F7]">
                    <span className="font-bold">&gt;&gt;</span> <span>You are typing...</span>
                  </li>
                </ul>
              </div>
              <div className="bg-white/10 p-3 border-2 border-white/20 text-center font-mono text-[11px] uppercase tracking-wider">
                Join arena to save rank
              </div>
            </div>
          </div>
        </div>
      </section>
     
     <Footer/>
    </div>
  );
}