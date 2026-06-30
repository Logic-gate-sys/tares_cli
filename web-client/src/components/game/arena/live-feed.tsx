import { useState, useEffect } from 'react';

type FeedItem = {
  id: number;
  user: string;
  word: string;
};

const INITIAL_FEED: FeedItem[] = [
  { id: 1, user: 'Scrambler', word: 'VORTEX' },
  { id: 2, user: 'NeonCat', word: 'PLUTO' },
  { id: 3, user: 'TaresKing', word: 'JAZZ' },
  { id: 4, user: 'TaresKing', word: 'QUARTZ' },
  { id: 5, user: 'RetroVibe', word: 'VORTEX' },
  { id: 6, user: 'TaresKing', word: 'PLUTO' },
];

const USERNAMES = ['SpikyDog', 'RetroVibe', 'NeonCat', 'TaresKing', 'Scrambler'];
const WORDS = ['GHOST', 'PLUTO', 'QUARTZ', 'VORTEX', 'JAZZ'];

export  const LiveFeed =() =>{
  const [feed, setFeed] = useState<FeedItem[]>(INITIAL_FEED);

  useEffect(() => {
    const interval = setInterval(() => {
      const newUser = USERNAMES[Math.floor(Math.random() * USERNAMES.length)];
      const newWord = WORDS[Math.floor(Math.random() * WORDS.length)];
      
      setFeed((prev) => {
        const newFeed = [{ id: Date.now(), user: newUser, word: newWord }, ...prev];
        return newFeed.slice(0, 6);
      });
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <aside className="md:col-span-3 space-y-md">
      <div className="bg-sky-blue border-4 border-deep-ink neubrutal-shadow p-md">
        <h2 className="font-headline-md text-headline-md border-b-4 border-deep-ink -mx-md -mt-md p-md mb-md bg-deep-ink text-paper-white">
          LIVE FEED
        </h2>
        <div className="space-y-sm max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
          {feed.map((item) => (
            <div key={item.id} className="flex items-center gap-sm bg-paper-white p-sm border-2 border-deep-ink animate-bounce">
              <span className="material-symbols-outlined text-action-red" style={{ fontVariationSettings: "'FILL' 1" }}>
                bolt
              </span>
              <p className="text-label-bold font-label-bold text-deep-ink">
                {item.user} unscrambled <span className="text-primary">{item.word}</span>
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Multiplier Card */}
      <div className="bg-action-red border-4 border-deep-ink neubrutal-shadow p-md text-paper-white transform -rotate-2">
        <div className="flex items-center justify-between">
          <span className="font-label-bold text-label-bold uppercase">Multiplier</span>
          <span className="font-display-lg text-[40px]">2.5x</span>
        </div>
      </div>
    </aside>
  );
}