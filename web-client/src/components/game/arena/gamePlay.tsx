import { useState } from 'react';

interface GameplayArenaProps {
  onSuccess: () => void;
  isOwner: boolean;
  status: string;
  timeLeft?: number;
  round?: number;
  message?: string;
  scramble?: string;
  onStart: () => void;
  onPause: () => void;
  onSubmit: (word: string) => void;
}

export const GameplayArena = ({ onSuccess, isOwner, status, timeLeft = 0, round = 0, message, scramble, onStart, onPause, onSubmit }: GameplayArenaProps) => {
  const [inputValue, setInputValue] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);

    if (value.toUpperCase() === 'ROUND') onSuccess();
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
      <div className="inline-flex md:grid grid-cols-[1fr_0.5fr] gap-md">
        <div className={`text-paper-white px-lg py-sm border-4 border-deep-ink neubrutal-shadow transform -rotate-1 ${isLowTime ? 'bg-action-red' : 'bg-deep-ink'}`}>
          <span className="font-label-mono text-label-mono uppercase tracking-[0.2em]">{`Round ${round}/${3} • ${status}`}</span>
          <div className="text-display-lg font-display-lg-mobile md:text-display-lg leading-none">
            {formatTime(timeLeft)}
          </div>
          {message && <div className="text-xs font-bold">{message}</div>}
        </div>

        <div className="text-paper-white px-md py-md border-4 border-deep-ink neubrutal-shadow transform -rotate-1 bg-green-800">
          {isOwner ? (
            <div className="flex flex-col gap-2">
              <button
                className="px-4 py-2 text-sm font-display-lg-mobile md:text-lg leading-none border-2 border-deep-ink bg-paper-white text-deep-ink transition-transform active:scale-90 disabled:cursor-not-allowed disabled:opacity-60"
                onClick={onStart}
                disabled={status !== 'WAITING'}
              >
                START GAME
              </button>
              <button
                className="px-4 py-2 text-sm font-display-lg-mobile md:text-lg leading-none border-2 border-deep-ink bg-action-red text-paper-white transition-transform active:scale-90 disabled:cursor-not-allowed disabled:opacity-60"
                onClick={onPause}
                disabled={!['COUNTDOWN', 'PLAYING', 'PAUSED'].includes(status)}
              >
                {status === 'PAUSED' ? 'RESUME GAME' : 'PAUSE GAME'}
              </button>
            </div>
          ) : (
            <div className="flex min-h-20 min-w-48 flex-col items-center justify-center gap-1 px-4 text-center">
              <span className="text-xs font-label-mono uppercase tracking-[0.15em]">
                Game status
              </span>
              <span className="text-lg font-headline-md leading-none">
                {status === 'PAUSED' ? 'GAME PAUSED' : status === 'WAITING' ? 'WAITING' : 'GAME STARTED'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* The Scrambled Word */}
      <div className="w-full flex flex-wrap justify-center gap-sm md:gap-md py-xl min-h-40 items-center">
        {(scramble || 'OUDNR').split('').map((letter, index) => (
          <LetterTile key={`${letter}-${index}`} letter={letter} delay={`${index / 10}s`} />
        ))}
      </div>

      {/* Input Field */}
      <div className="w-full max-w-2xl relative group">
        <input
          autoFocus
          type="text"
          value={inputValue}
          required
          onChange={handleInputChange}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              onSubmit(inputValue);
              setInputValue('');
            }
          }}
          placeholder="TYPE YOUR ANSWER..."
          className="w-full bg-paper-white border-4 border-deep-ink px-lg py-xl font-headline-md text-headline-md uppercase placeholder:opacity-20 focus:outline-none focus:border-action-red neubrutal-shadow transition-all group-active:translate-x-1 group-active:translate-y-1 group-active:shadow-none"
        />
        <button type="button" onClick={() => { onSubmit(inputValue); setInputValue(''); }} className="absolute right-4 top-1/2 -translate-y-1/2 bg-action-red text-paper-white border-2 border-deep-ink px-md py-sm font-label-bold text-label-bold neubrutal-shadow-sm hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all active:scale-95">
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
