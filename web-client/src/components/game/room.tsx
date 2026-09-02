
type RoomData = {
  id: string;
  name: string;
  ownerId?: string;
  capacity: number; // max players 
  icon: string; // icon url return from server 
  iconBgClass: string;
  iconTextColorClass: string;
  players?:number,
  playersText?: string;
  timeLeftText?: string;
  avatars?: {src: string;alt: string;bgClass: string;}[];
  extraPlayersCount?: number; 
  isOnline?:boolean,
  
}
type Props = {
  data: RoomData,
  playerId: string;
  onJoin?: () => void;
  onOpenSettings?: () => void;
  onOpenDelete?: () => void;
  onToggleStatus?: () => void;
}

export const RoomCard = ({data, playerId,onJoin,onOpenSettings, onOpenDelete, onToggleStatus}: Props) => {
  const isOwner = playerId === data.ownerId? true: false; 
  
  return (
    <div className="bg-paper-white border-4 border-deep-ink p-6 neubrutalism-shadow-sm hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(18,23,33,1)] transition-all group">
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Room Header & Details */}
        <div className="flex items-center gap-6">
          <div className={`${data.iconBgClass} p-4 border-2 border-deep-ink text-paper-white`}>
            <span className="material-symbols-outlined text-3xl">{data.icon}</span>
          </div>
          <div>
            <h4 className="text-headline-md font-headline-md text-deep-ink">{data.name}</h4>
            <p className="text-body-md font-body-md text-secondary flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">groups</span>{' '}
              {data.players}/{data.capacity} Players • {data.timeLeftText}
            </p>
          </div>
        </div>

        {/* Player Avatars & Join Button */}
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="flex -space-x-4">
            {data.avatars.map((avatar, idx) => (
              <img
                key={idx}
                className={`w-10 h-10 rounded-full border-2 border-deep-ink ${avatar.bgClass || 'bg-sky-blue'}`}
                src={avatar.src}
                alt={avatar.alt || 'Player avatar'}
              />
            ))}
            {data.extraPlayersCount > 0 && (
              <div className="w-10 h-10 rounded-full border-2 border-deep-ink bg-deep-ink flex items-center justify-center text-paper-white font-label-bold text-xs">
                +{data.extraPlayersCount}
              </div>
            )}
          </div>
          <button
            onClick={onJoin}
            className="flex-1 md:flex-none px-6 py-2 bg-sky-blue border-2 border-deep-ink font-label-bold text-deep-ink group-hover:bg-action-red group-hover:text-paper-white transition-colors"
          >
            JOIN ARENA
          </button>
        </div>
      </div>

      {/* Host Terminal Bar */}
      
      {isOwner && (
        <div className="mt-6 pt-4 border-t-4 border-deep-ink flex items-center justify-between bg-surface-container p-3">
          <div className="flex items-center gap-4">
            <span className="text-label-mono font-label-mono uppercase text-xs font-bold">
              Host Terminal:
            </span>
            <div className="flex items-center gap-2 bg-paper-white border-2 border-deep-ink p-1 rounded-lg">
              <span className="text-xs font-label-bold px-2">STATUS</span>
              <button
                onClick={onToggleStatus}
                className={`${
                  data.isOnline ? 'bg-action-red' : 'bg-deep-ink'
                } text-paper-white px-3 py-1 border-2 border-deep-ink text-xs font-label-bold active:scale-95 transition-transform`}
              >
                {data.isOnline ? 'ONLINE' : 'OFFLINE'}
              </button>
            </div>
          </div>
  
          {/* Action Controls */}
          <div className="flex gap-2">
            <button
              onClick={onOpenSettings}
              className="w-10 h-10 bg-paper-white border-2 border-deep-ink flex items-center justify-center hover:bg-action-red hover:text-paper-white transition-colors shadow-[2px_2px_0px_0px_rgba(18,23,33,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px]"
            >
              <span className="material-symbols-outlined">settings</span>
            </button>
            <button
              onClick={onOpenDelete}
              className="w-10 h-10 bg-action-red text-paper-white border-2 border-deep-ink flex items-center justify-center hover:bg-deep-ink transition-colors shadow-[2px_2px_0px_0px_rgba(18,23,33,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px]"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        </div>
      )
        
      }
     
    </div>
  );
}