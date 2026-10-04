import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '#store/store';
import { pushToGameRoom } from '#store/slices/arena';
import { LiveFeed, GameplayArena, SuccessToast } from '#components/game/arena'
import { PlayerStats } from '#components/player/stats';




export function Arena() {
  const dispatch = useDispatch();
  const { room, gameState, timer, round, message, scramble } = useSelector((state: RootState) => state.arena);
  const { user } = useSelector((state: RootState) => state.auth);
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
      <main className="max-h-3xl  max-w-7xl mx-auto px-margin-mobile md:px-margin-desktop py-lg grid grid-cols-1 md:grid-cols-12 gap-lg relative pb-10">
        <div className="hidden lg:block absolute left-20 top-40 opacity-20">
          <img alt="Game Mascot" className="w-64 rotate-[-15deg]" src="https://lh3.googleusercontent.com/aida/AP1WRLtWYV2e3BY65W_6ZafUYLDa1Xmlk7YjL2prZdJk2klHyZi6SR1ZdNyIiaSQvpMRua8-YZ8XETC1dRRN_K87dgwhq2YnKIuUX0jj74glIKns1_n4QEdbXjH9dF4QPzYa_8fDmwAN-CBkv2v5xNr13PQl3n7NhJutulwhZYixsu6Od2YnKU9V_e0pIRqiQa5lFOQAgkH-4EGPGGYw8-CW0pNCMioOvDAJgvo_yPR3nnE5AnUeI1HId26YL8qW" />
        </div>

        <LiveFeed />
        <GameplayArena
          onSuccess={handleSuccess}
          isOwner={room?.ownerId !== undefined && user?.id !== undefined && String(room.ownerId) === String(user.id)}
          status={gameState ?? 'WAITING'}
          timeLeft={timer}
          round={round?.roundNo}
          message={message}
          scramble={scramble}
          onStart={() => dispatch(pushToGameRoom({type: 'in:game', payload: { action: 'START_GAME', value: {userId: user.id} } }))}
          onPause={() => dispatch(pushToGameRoom({
            type: 'in:game',
            payload: {
              action: gameState === 'PAUSED' ? 'RESUME_GAME' : 'PAUSE_GAME' ,
              value: {userId: user.id},
            },
          }))}
          onSubmit={(word) => dispatch(pushToGameRoom({ type: 'in:game', payload: { action: 'SEND_WORD', value: { word } } }))}
        />
        <PlayerStats />
      </main>
      <SuccessToast isVisible={showSuccessToast} />
    </>
  );
}
