type FeedItem = {
  id: number;
  user: string;
  word: string;
  score: number;
};

export const LiveFeed = ({ feed }: { feed: FeedItem[] }) => {
  return (
    <aside className="md:col-span-3 space-y-md">
      <div className="bg-sky-blue border-4 border-deep-ink neubrutal-shadow p-md">
        <h2 className="font-headline-md text-headline-md border-b-4 border-deep-ink -mx-md -mt-md p-md mb-md bg-deep-ink text-paper-white">
          LIVE FEED
        </h2>
        <div className="space-y-sm max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
          {feed.length === 0 ? (
            <p className="bg-paper-white p-sm border-2 border-deep-ink font-label-bold text-deep-ink">
              No words submitted yet
            </p>
          ) : feed.map((item) => (
            <div key={item.id} className="flex items-center gap-sm bg-paper-white p-sm border-2 border-deep-ink animate-bounce">
              <span className="material-symbols-outlined text-action-red" style={{ fontVariationSettings: "'FILL' 1" }}>
                bolt
              </span>
              <p className="text-label-bold font-label-bold text-deep-ink">
                {item.user} unscrambled <span className="text-primary">{item.word.toUpperCase()}</span>
                <span className="ml-1 text-xs">+{item.score}</span>
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-action-red border-4 border-deep-ink neubrutal-shadow p-md text-paper-white transform -rotate-2">
        <div className="flex items-center justify-between">
          <span className="font-label-bold text-label-bold uppercase">Multiplier</span>
          <span className="font-display-lg text-[40px]">1x</span>
        </div>
      </div>
    </aside>
  );
};
