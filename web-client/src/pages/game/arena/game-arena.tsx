import { useState, useEffect } from 'react';
import { LiveFeed, GameplayArena, SuccessToast} from '#components/game/arena'
import { PlayerStats } from '#components/player/stats';

export  function Arena() {
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  // Apply body classes on mount if not handled globally in index.html
  useEffect(() => {
    document.documentElement.classList.add('light');
    document.body.className = "bg-surface text-deep-ink font-body-md overflow-x-hidden min-h-screen bg-grid";
  }, []);

  const handleSuccess = () => {
    setShowSuccessToast(true);
    setTimeout(() => {
      setShowSuccessToast(false);
    }, 2000);
  };

  return (
    <>
      <main className="max-w-7xl mx-auto px-margin-mobile md:px-margin-desktop py-lg grid grid-cols-1 md:grid-cols-12 gap-lg relative pb-32">
        {/* Decoration Left */}
        <div className="hidden lg:block absolute -left-20 top-40 opacity-20">
          <img alt="Game Mascot" className="w-64 rotate-[-15deg]" src="https://lh3.googleusercontent.com/aida/AP1WRLtWYV2e3BY65W_6ZafUYLDa1Xmlk7YjL2prZdJk2klHyZi6SR1ZdNyIiaSQvpMRua8-YZ8XETC1dRRN_K87dgwhq2YnKIuUX0jj74glIKns1_n4QEdbXjH9dF4QPzYa_8fDmwAN-CBkv2v5xNr13PQl3n7NhJutulwhZYixsu6Od2YnKU9V_e0pIRqiQa5lFOQAgkH-4EGPGGYw8-CW0pNCMioOvDAJgvo_yPR3nnE5AnUeI1HId26YL8qW" />
        </div>

        <LiveFeed />
        <GameplayArena onSuccess={handleSuccess} />
        <PlayerStats />
      </main>

      <SuccessToast isVisible={showSuccessToast} />
    </>
  );
}