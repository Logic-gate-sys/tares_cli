import { useState, useEffect } from 'react';

interface GameplayArenaProps {
  onSuccess: () => void;
}

export  const GameplayArena=({ onSuccess }: GameplayArenaProps)=>{
  const [timeLeft, setTimeLeft] = useState(44);
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    if (timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLeft]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    
    if (value.toUpperCase() === 'ROUND') {
      onSuccess();
      setTimeout(() => setInputValue(''), 2000);
    }
  };

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = time % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isLowTime = timeLeft < 10;

  return (
    <section className="md:col-span-6 space-y-xl flex flex-col items-center">
      {/* Game Clock */}
      <div className="inline-flex flex-col items-center gap-xs">
        <div className={`text-paper-white px-lg py-sm border-4 border-deep-ink neubrutal-shadow transform -rotate-1 ${isLowTime ? 'bg-action-red' : 'bg-deep-ink'}`}>
          <span className="font-label-mono text-label-mono uppercase tracking-[0.2em]">Time Remaining</span>
          <div className="text-display-lg font-display-lg-mobile md:text-display-lg leading-none">
            {formatTime(timeLeft)}
          </div>
        </div>
      </div>

      {/* The Scrambled Word */}
      <div className="w-full flex flex-wrap justify-center gap-sm md:gap-md py-xl min-h-[160px] items-center">
        <LetterTile letter="O" delay="0.1s" />
        <Divider />
        <LetterTile letter="U" delay="0.4s" />
        <Divider />
        <LetterTile letter="D" delay="0.2s" />
        <Divider />
        <LetterTile letter="N" delay="0.6s" />
        <Divider />
        <LetterTile letter="R" delay="0.3s" />
      </div>

      {/* Input Field */}
      <div className="w-full max-w-2xl relative group">
        <input
          autoFocus
          type="text"
          value={inputValue}
          required
          onChange={handleInputChange}
          placeholder="TYPE YOUR ANSWER..."
          className="w-full bg-paper-white border-[4px] border-deep-ink px-lg py-xl font-headline-md text-headline-md uppercase placeholder:opacity-20 focus:outline-none focus:border-action-red neubrutal-shadow transition-all group-active:translate-x-1 group-active:translate-y-1 group-active:shadow-none"
        />
        <button className="absolute right-4 top-1/2 -translate-y-1/2 bg-action-red text-paper-white border-2 border-deep-ink px-md py-sm font-label-bold text-label-bold neubrutal-shadow-sm hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all active:scale-95">
          SUBMIT
        </button>
      </div>

      {/* Hint Button */}
      <button className="group flex items-center gap-sm bg-sky-blue border-4 border-deep-ink px-lg py-md font-label-bold text-label-bold neubrutal-shadow hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all active:scale-95">
        <span className="material-symbols-outlined">lightbulb</span>
        NEED A HINT? (-50 PTS)
      </button>
    </section>
  );
}

const LetterTile = ({ letter, delay }: { letter: string; delay: string }) => (
  <div 
    className="word-tile w-16 h-16 md:w-24 md:h-24 bg-paper-white border-[3px] border-deep-ink rounded-lg neubrutal-shadow flex items-center justify-center float-animation"
    style={{ animationDelay: delay }}
  >
    <span className="font-headline-md text-headline-md md:text-headline-lg">{letter}</span>
  </div>
);

const Divider = () => <div className="text-deep-ink font-bold opacity-30 text-2xl">-</div>;