import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreateRoomModal } from '#components/form-modals';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from 'src/store/store';
import { type Room, type RoomCreateType } from '#types/entities';
import { useCreateRoomMutation, useDeleteRoomMutation, useUpdateRoomMutation } from '#store/services/roomExtend';
import { pushToLobby } from '#store/slices/lobby'
import { RoomCard } from '#components/game/room';
import { DeleteModal } from '#components/game/deleteModal';
import { SettingsModal } from '#components/game/roomSettingModal';
import { useUI } from '#context/uiContext';
import { Loader } from '#components/ui/loader';
import { changeStatus, setRoom } from '#store/slices/arena';



export function Lobby() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { availableRooms, message } = useSelector((state: RootState) => state.lobby)
  const {user} = useSelector((state: RootState) => state.auth);
  const arenaState = useSelector((state: RootState) => state.arena);
  const { showNotice } = useUI();
  // RTK QUERY & MUTATION FLAGS
  const [createRoom, { isLoading: isCreating }] = useCreateRoomMutation();
  const [deleteRoom, { isLoading: isDeleting }] = useDeleteRoomMutation();
  const [updateRoom, { isLoading: isUpdating }] = useUpdateRoomMutation();
  // MODALS & SELECTION STATES
  const [openRoomSettings, setOpenRoomSettings] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [selectedRooId, setSelectedRoomId] = useState<string>();
  const [openModal, setOpenModal] = useState<boolean>(false);

  const selectedRoom = selectedRooId ? availableRooms?.find((rm) => rm.id === selectedRooId) : null
  const isBusy = isCreating || isDeleting || isUpdating;


  // ASYNC HANDLERS
  const handleCreateRoom = async (data: RoomCreateType) => {
    try {
      await createRoom(data).unwrap();
      setOpenModal(false)
      dispatch(pushToLobby({ type: 'in:lobby', payload: { action: 'room:create', value: { name: data.name } } }))
      showNotice("Success", "Room created successfully")
    } catch (err: unknown) {
      console.log("error: ", err)
      showNotice("Error !", "Failed to create room ")
    }
  }
  const handleUpdateRoom = async (data: Partial<Room>) => {
    try {
      await updateRoom(data).unwrap();
      setOpenRoomSettings(false);
      dispatch(pushToLobby({ type: 'in:lobby', payload: { action: 'room:update', value: { name: data.name } } }));
      showNotice("Success", "Room updated successfully")
    } catch (err: unknown) {
      console.log("error: ", err)
      showNotice("Error !", "Failed to update room ")
    }
  }
  // deleting a room
  const handleDeleteRoom = async () => {
    if (!selectedRooId) return;
    try {
      await deleteRoom({ id: selectedRooId }).unwrap();
      showNotice("Success", "Room deleted successfully");
      setOpenDelete(false)
    } catch (err: unknown) {
      console.error("Failed to delete room: ", err)
      showNotice("Error!", "Failed to delete room ");
    }
  }
  // handle sending join requests
  const handleRoomJoinRequest = async (e: React.MouseEvent | undefined, roomId: string) => {
    e?.preventDefault();
    if (!roomId) return;
    try {
      if (!user) return;
      dispatch(pushToLobby({
        type: 'in:lobby', payload: {
          action: "request:room:join", value: {
            roomId: roomId
          }
        }
      }));
      showNotice("Success", "Request sent to room owner, please wait while your request is processed...")
    } catch (err) {
      console.error(err)
      showNotice("Error", "Request to join room failed")
    }
  }

  const handleEnterOwnRoom = (e: React.MouseEvent | undefined) => {
    // prevent default page reload behaviour
    e.preventDefault();
    dispatch(changeStatus("room:in"));
    dispatch(setRoom(selectedRoom));
  };


  useEffect(() => {
    if (arenaState.status === "room:in" && arenaState.room) {
      showNotice("Success", "Room join request successuful. waitting while we connect you to room");
      navigate("/game/arena");
    } else if (arenaState.status === "room:out") {
      showNotice("Notice", message);
    }
  }, [arenaState.room, arenaState.status, navigate, showNotice, message]);



  return (
    <div className="relative bg-surface text-on-surface min-h-screen overflow-x-hidden font-body-md selection:bg-action-red selection:text-white">
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
              {availableRooms.map((arena, idx) => {
                return <div key={idx} onClick={() => setSelectedRoomId(arena.id)}>
                  <RoomCard data={arena} playerId={user?.id}
                    onJoin={(event) => handleRoomJoinRequest(event, arena.id)}
                    onEnterOwnRoom={(event) => handleEnterOwnRoom(event)}
                    onOpenDelete={() => setOpenDelete(true)}
                    onOpenSettings={() => setOpenRoomSettings(true)}
                  />
                </div>
              })}
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
                  <p className="text-headline-md font-headline-md">{user.wins}</p>
                </div>
                <div className="bg-action-red p-4 border-2 border-paper-white text-paper-white text-center">
                  <p className="text-label-mono font-label-mono text-xs uppercase opacity-70">LEVEL</p>
                  <p className="text-headline-md font-headline-md">{ user.rank}</p>
                </div>
                <div className="col-span-2 bg-sky-blue p-4 border-2 border-paper-white text-deep-ink flex justify-between items-center">
                  <p className="text-label-bold font-label-bold">ACCURACY</p>
                  <p className="text-headline-md font-headline-md">{user.accuracy}%</p>
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

        <Loader isLoading={isBusy} />
        {/*--------------- MODAL FORM -----------------*/}
        {openModal && (<CreateRoomModal onClose={() => setOpenModal(false)} onSubmit={handleCreateRoom} />)}
        {openDelete && <DeleteModal title={selectedRoom?.name ?? ""} onClose={() => setOpenDelete(false)} onConfirm={handleDeleteRoom} />}
        {openRoomSettings && <SettingsModal room={selectedRoom} onClose={() => setOpenRoomSettings(false)} onSave={handleUpdateRoom} />}

        {/*--------------- PETITION MODAL STACK -----------------*/}


      </main>
    </div>
  );
}
