import { NavLink } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { CreateRoomModal } from '#components/form-modals';
import { MessageBox } from '#components/ui/notification';
import { useSelector } from 'react-redux';
import type { RootState } from 'src/store/store';
import { type Room } from '#types/entities';
import { useCreateRoomMutation } from '#store/services/room-extend';
import { Loader } from '#components/ui/loader';




const ARENAS_DATA: Room[] = [
  {
    id: 'cyberpunk-city',
    name: 'CYBERPUNK CITY',
    capacity: 8,
    icon: 'sports_esports',
    iconBgClass: 'bg-primary-container',
    iconTextColorClass: 'text-paper-white',
    playersText: '5/8 Players',
    timeLeftText: '02:45 Left',
    avatars: [
      { src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCsVRk3dArpX4pYLssMhALAvOfYy80K900dqMN3thc1H4ULtZxJgdRQxhh8I_hjegJkZUqHNV4c80NeeqN9Y76ws3G4nWUpdXFeW4JiR5BYEZ0EGonA9Ot_vKJkQ6mSALOMVeQKElxXNwe2wSgwNp_euBs9U1sDQP0Ocpq-uWTDZoau449QwkY718hBpV62rM9LcCaR2bPosPZAj5lxVz9UaI3yRrZ9EustfCi49z2FQmDN63wATtIAJ6wrwEP6RH_5ujQdp77bkAR6', alt: 'Cyberpunk player avatar', bgClass: 'bg-sky-blue' },
      { src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAxhP-_1o3-uU8VwUvUOWEMZL5olbaT_PWiyqh02W7qcXD9qXQOkajEdaPVOfAlF_EgParp5a7-KwPc0C2YKih0SdIet1s7xhU6PNpMBgZWeZRAHuK66JWHjygqiHUlAqduWG3X9uic5RcTvVJ6ObKXKJO9JiX9MyS6NmfEXztAhXUGicxeamxkK9OD5PEuQuGQJqT0QSaHFrmeoBOgbEWR7dQqqVKocx3kr4mePrPeWbUHo_QAc0HXw_GXfmO1NebTE9Fo4YD8W3D3', alt: 'Pro gamer avatar', bgClass: 'bg-primary-fixed' },
    ],
    extraPlayersCount: 3,
  },
  {
    id: 'hacker-zenith',
    name: 'HACKER ZENITH',
    capacity: 8,
    icon: 'terminal',
    iconBgClass: 'bg-secondary-container',
    iconTextColorClass: 'text-deep-ink',
    playersText: '2/8 Players',
    timeLeftText: 'Starting Soon',
    avatars: [
      { src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCURNcvzYRg2m1fZfp1lU0x6fhDS-iMC4U25W04dxetpXSGYaCoOp-nIQRiYIpsX1CyBdrpFY6nXimW80xLs8SL0ORxj9clrSDKJA-E1ebTyob7SkA6edvrNg8X0FAu8pQeN6jOYVy8houupFCKY0rb3wS4jOtPZpb3DJiw2ezjsQogXXzCVzXtVHNH_MRdmo0LShdMG_J_tBZdReVB7Zi9ewMIkIH8wji1zd6trhhLO8jEcVCXH_5RNC-l4PlzijKEjgXchXFz_H5e', alt: 'Futuristic hacker avatar', bgClass: 'bg-tertiary-fixed' },
      { src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuChySjq5xRvuYlJnMD-UlBba6HRfKUz5LfwzV-njsA0iqaDY5WVzfuVTXzoh-5FXkodumKjNihxqfWqOGYepRgJytdxvtWFb0RlDXcDtDoBDBmv5UJeoHBUtgUexrtR8U1vHR07wOLJ0ZOz79uzLX0HiUOwWXgrpb4V7W7hm4HENliAmO9IszFr0lXPDJw_EAyDFvCJR4ZhkrcUOZ_0Dthd96nBytUzQl5Av9cdcnbfTPPnm9qBIvQItalJOgN1hfGSEBIEbBrkF4L1', alt: 'Competitive player avatar', bgClass: 'bg-sky-blue' },
    ],
  },
  {
    id: 'speed-runners',
    name: 'SPEED RUNNERS',
    capacity: 8,
    icon: 'bolt',
    iconBgClass: 'bg-tertiary-container',
    iconTextColorClass: 'text-paper-white',
    playersText: '7/10 Players',
    timeLeftText: '00:52 Left',
    avatars: [
      { src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCYndfhK6Cd97AmI11RP_vtulSUCLq7VoXmSpo-7JaQtTI9Ssdj0YKC_4AMa_JG12g8XiX2ofjy3Zle3VedQBkSSlC24tLHy6sB4lGPUiKhk2PetVkRLtllLOc5xcHt3l9aNruCvpts-NRl289wR6MEHRYhtOnD6ppcJmKbS3nqIX4gqKCr8uRzTtIREg8hvXRh9QBDGrEowlxkz9kwjDgW57ZAHCzt_FbIR0vh676d5anJGD-SYCRct0TEOtO3Jx7Z5PNYUB_5q48U', alt: 'Street culture avatar', bgClass: 'bg-primary-fixed' },
      { src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDfT3NDy0L0qBHLIQAWeKzK2deBJcPgqVa3_7BGkK5xKpiUbhTxfUgrKNP4xz_k_fycX8-eBYP-Qcd-Xy7UL3Hz0OZT_2ITRSBf59F6ainikF_hQp00Ghhje6aF099Gkr1snFr7fsb_vlTmb7l3yqBvatCHSCyFfjdUw_TMEpXWHykmS-0mMsX1RawE2ID3uCi03Vt3M_QF2Y4gFQa_JSDmaRE_YCZppuFRwIq-MAkyIThgh_2VKccukdj6Byhsqb4RXZ22G4UAVsoJ', alt: 'Female gamer avatar', bgClass: 'bg-secondary-fixed' },
    ],
    extraPlayersCount: 5,
  },
];

export function Lobby() {
  const { availableRooms, socketStatus, message } = useSelector((state: RootState) => state.lobby)
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [createRoom, { isLoading, isSuccess, isError, error }] = useCreateRoomMutation();
  const [progress, setProgress] = useState<number>(35);
  const [showLoader, setShowLoader] = useState(false);
  const [showMsg, setShowMsg] = useState<boolean>(false); 

  useEffect(() => {
    let progressInterval: NodeJS.Timeout;
    const runProgress = () => {
      if (isLoading) {
        // Start loading sequence
        setShowLoader(true);
        setProgress(15); // Initial jump
        // Slowly creep up to 85% while waiting for the server
        progressInterval = setInterval(() => {
          setProgress((prev) => (prev < 85 ? prev + Math.floor(Math.random() * 10) + 5 : prev));
        }, 400);

      } else if (isSuccess) {
        // Snap to 100% on success
        setProgress(100);
        // Keep the loader on screen just long enough for the user to see "100%"
        setTimeout(() => {
          setShowLoader(false);
          setOpenModal(false); 
          setProgress(0);
        }, 600);

        setShowMsg(true); 

      } else if (isError) {
        // Handle failure (optional: show an error state in the loader)
        setShowLoader(false);
        setShowMsg(true)
        setProgress(0);
      }
    }
    runProgress();
    // Cleanup interval on unmount or state change
    return () => clearInterval(progressInterval);
  }, [isLoading, isSuccess, isError]);

  
  const handleCreateRoom = async (data: FormData) => {
    try {
      const res = await createRoom(data).unwrap();
      console.log('ROOM CREATION RES: ', res)
      setOpenModal(false)
    } catch (err: unknown) {
      console.error("Failed to create room: ", err)
    }
  }
  return (
    <div className="bg-surface text-on-surface min-h-screen overflow-x-hidden font-body-md selection:bg-action-red selection:text-white">
      {/* Dynamic Neubrutalism Styles Injector */}
      <style dangerouslySetInnerHTML={{
        __html: `
        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
        .neubrutalism-shadow {
          box-shadow: 8px 8px 0px 0px #121721;
        }
        .neubrutalism-shadow-sm {
          box-shadow: 4px 4px 0px 0px #121721;
        }
        .sticker {
          pointer-events: none;
          filter: drop-shadow(2px 2px 0px #121721);
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(-3deg); }
          50% { transform: translateY(-10px) rotate(3deg); }
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f3ff;
          border-left: 2px solid #121721;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #EC2513;
          border: 2px solid #121721;
        }
      `}} />

      <main className="pt-24 pb-24 px-4 md:px-margin-desktop min-h-screen relative">
        {/* Stickers / Decorative elements */}
        <div className="absolute top-28 right-10 animate-float sticker z-0 hidden lg:block">
          <div className="bg-primary-container text-paper-white p-4 border-4 border-deep-ink rotate-12 text-headline-md font-headline-md neubrutalism-shadow">
            WOW!
          </div>
        </div>
        <div className="absolute bottom-20 animate-float sticker z-0 hidden lg:block left-10" style={{ animationDelay: '1s' }}>
          <div className="bg-secondary-container text-deep-ink p-3 border-4 border-deep-ink -rotate-6 font-label-bold neubrutalism-shadow-sm">
            #WORDLIFE
          </div>
        </div>

        {/* Quick Join Hero */}
        <section className="mb-xl relative z-10">
          <div className="bg-sky-blue border-4 border-deep-ink p-8 neubrutalism-shadow flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="text-center md:text-left">
              <h2 className="text-display-lg-mobile md:text-display-lg font-display-lg text-deep-ink mb-4">
                READY TO <span className="text-action-red">SCRAMBLE?</span>
              </h2>
              <p className="text-body-lg font-body-lg text-deep-ink max-w-2xl">
                Jump into the fastest-growing word arena. Beat the clock, outsmart your rivals, and climb the global ranks.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
              <button className="bg-action-red text-paper-white px-12 py-6 border-4 border-deep-ink neubrutalism-shadow text-headline-md font-headline-md hover:scale-[1.02] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-4">
                QUICK JOIN
                <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: '"FILL" 1' }}>bolt</span>
              </button>
              <button className="bg-paper-white text-deep-ink px-12 py-6 border-4 border-deep-ink neubrutalism-shadow text-headline-md font-headline-md hover:scale-[1.02] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-4"
                onClick={() => setOpenModal(true)}>
                CREATE
                <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: '"FILL" 1' }}>add_circle</span>
              </button>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
          {/* Live Arenas List */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <h3 className="text-headline-lg font-headline-lg text-deep-ink flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">sensors</span>
                LIVE ARENAS
              </h3>
              <div className="flex gap-2">
                <span className="px-4 py-1 bg-deep-ink text-paper-white font-label-bold border-2 border-deep-ink rounded-full">42 ONLINE</span>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              {ARENAS_DATA.map((arena) => (
                <div
                  key={arena.id}
                  className="bg-paper-white border-4 border-deep-ink p-6 neubrutalism-shadow-sm hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(18,23,33,1)] transition-all group"
                >
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-6">
                      <div className={`${arena.iconBgClass} ${arena.iconTextColorClass} p-4 border-2 border-deep-ink`}>
                        <span className="material-symbols-outlined text-3xl">{arena.icon}</span>
                      </div>
                      <div>
                        <h4 className="text-headline-md font-headline-md text-deep-ink">{arena.name}</h4>
                        <p className="text-body-md font-body-md text-secondary flex items-center gap-2">
                          <span className="material-symbols-outlined text-sm">groups</span>
                          {arena.playersText} • {arena.timeLeftText}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 w-full md:w-auto">
                      <div className="flex -space-x-4">
                        {arena.avatars.map((avatar, idx) => (
                          <img
                            key={idx}
                            className={`w-10 h-10 rounded-full border-2 border-deep-ink ${avatar.bgClass}`}
                            alt={avatar.alt}
                            src={avatar.src}
                          />
                        ))}
                        {arena.extraPlayersCount && (
                          <div className="w-10 h-10 rounded-full border-2 border-deep-ink bg-deep-ink flex items-center justify-center text-paper-white font-label-bold text-xs">
                            +{arena.extraPlayersCount}
                          </div>
                        )}
                      </div>
                      <button className="flex-1 md:flex-none px-6 py-2 bg-sky-blue border-2 border-deep-ink font-label-bold text-deep-ink group-hover:bg-action-red group-hover:text-paper-white transition-colors">
                        JOIN ARENA
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Stats & Sidebar */}
          <aside className="lg:col-span-4 flex flex-col gap-8">
            {/* Quick Stats Card */}
            <div className="bg-deep-ink border-4 border-deep-ink p-6 neubrutalism-shadow text-paper-white">
              <h3 className="text-headline-md font-headline-md mb-6 border-b-2 border-paper-white pb-2">YOUR STATS</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-paper-white p-4 border-2 border-paper-white text-deep-ink text-center">
                  <p className="text-label-mono font-label-mono text-xs uppercase opacity-70">WINS</p>
                  <p className="text-headline-md font-headline-md">124</p>
                </div>
                <div className="bg-action-red p-4 border-2 border-paper-white text-paper-white text-center">
                  <p className="text-label-mono font-label-mono text-xs uppercase opacity-70">LEVEL</p>
                  <p className="text-headline-md font-headline-md">42</p>
                </div>
                <div className="col-span-2 bg-sky-blue p-4 border-2 border-paper-white text-deep-ink flex justify-between items-center">
                  <p className="text-label-bold font-label-bold">ACCURACY</p>
                  <p className="text-headline-md font-headline-md">94%</p>
                </div>
              </div>
            </div>

            {/* Daily Challenge Teaser */}
            <div className="bg-primary-fixed border-4 border-deep-ink p-6 neubrutalism-shadow relative overflow-hidden group">
              <div className="relative z-10">
                <p className="text-label-bold font-label-bold text-primary mb-1">DAILY CHALLENGE</p>
                <h4 className="text-headline-md font-headline-md text-deep-ink mb-4">THE MEGASCRAMBLE</h4>
                <div className="flex items-center gap-2 text-primary font-bold">
                  <span>WIN 500 COINS</span>
                  <span className="material-symbols-outlined">trending_flat</span>
                </div>
              </div>
              <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-9xl text-deep-ink opacity-10 group-hover:rotate-12 transition-transform">
                star
              </span>
            </div>
          </aside>
        </div>



        {/* Bottom Navigation (Mobile Only) */}
        <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center h-20 px-4 pb-safe bg-sky-blue border-t-4 border-deep-ink shadow-[0px_-4px_0px_0px_#121721] md:hidden">
          <NavLink
            to="/home"
            className={({ isActive }) => `flex flex-col items-center justify-center p-2 transition-all active:scale-95 ${isActive ? "text-action-red font-bold" : "text-deep-ink"}`}
          >
            <span className="material-symbols-outlined">home</span>
            <span className="text-label-bold font-label-bold">Home</span>
          </NavLink>

          <NavLink
            to="/lobby"
            className={({ isActive }) => `flex flex-col items-center justify-center p-2 border-2 border-deep-ink rounded-lg transition-all active:scale-95 ${isActive ? "bg-secondary-container text-deep-ink font-bold" : "text-deep-ink"}`}
          >
            <span className="material-symbols-outlined">group</span>
            <span className="text-label-bold font-label-bold">Lobby</span>
          </NavLink>

          <NavLink
            to="/play"
            className="flex flex-col items-center justify-center bg-action-red text-paper-white border-2 border-deep-ink rounded-lg px-4 py-1 translate-y-[-4px] shadow-[4px_4px_0px_0px_#121721] active:scale-95 transition-transform"
          >
            <span className="material-symbols-outlined">videogame_asset</span>
            <span className="text-label-bold font-label-bold">Play</span>
          </NavLink>

          <NavLink
            to="/stats"
            className={({ isActive }) => `flex flex-col items-center justify-center p-2 transition-all active:scale-95 ${isActive ? "text-action-red font-bold" : "text-deep-ink"}`}
          >
            <span className="material-symbols-outlined">trophy</span>
            <span className="text-label-bold font-label-bold">Stats</span>
          </NavLink>
        </nav>
        {/*--------------- MODAL FORM -------------------------*/}
        {openModal && (<CreateRoomModal onClose={() => setOpenModal(false)} onSubmit={handleCreateRoom} />)}
        {showMsg && <MessageBox message={message.split('.')}  onClose={()=>setShowMsg(false)} onContinue={()=> setShowMsg(false)} />}
        {showLoader && <Loader progress={progress} />}
      </main>

    </div>
  );
}
