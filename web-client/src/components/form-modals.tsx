import type { ClientMessage } from "#types/messages";
import { type RoomCreateType } from "#types/entities";
import { useState, useCallback } from "react";
import { ICONBG_CLASS, ICONTEXTCOLOR_CLSS } from '#components/constants';


type FormModalProps = {
  onSubmit: (data:ClientMessage) => void;
  onClose?: () => void; 
}

const initData = {
    name: '',
    capacity:0,
    iconBgClass: ICONBG_CLASS[Math.random() * ICONBG_CLASS.length],
    iconTextColorClass: ICONTEXTCOLOR_CLSS[Math.random() * ICONTEXTCOLOR_CLSS.length]
  }

export function CreateRoomModal({ onSubmit, onClose }: FormModalProps) {
  const [data, setData] = useState<RoomCreateType>(initData);
  const [icon, setIcon] = useState<File | null>();

  useCallback(() => {
    setData(prev => ({
      ...prev,
      
    }))
  }, [])
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!data.name.trim() || !icon) return;
    const formData = new FormData();
    formData.append("icon", icon);
    formData.append("data", JSON.stringify(data));
    console.log("FILE: ", icon);
    onSubmit({type: 'in:lobby',payload: {action:'room:create', value:formData}});
    onClose()
  }

  return (
      <>
        <div className="fixed max-w-full inset-0 z-100 flex items-center justify-center p-4">
          
          {/* BACKDROP: Absolute fills the fixed container, pushing it behind the box */}
          <div className="absolute inset-0 bg-deep-ink opacity-70" onClick={onClose}></div>
          
          {/* MODAL BOX: Now properly layered over the backdrop via z-10 and constrained by max-w-xl */}
          <div className="relative bg-paper-white border-4 border-deep-ink p-8 w-full max-w-2xl neubrutalism-shadow z-10">
            
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-headline-md font-headline-md text-deep-ink uppercase">HOST AN ARENA</h2>
              <button onClick={onClose} className="text-deep-ink hover:text-action-red transition-colors">
                <span className="material-symbols-outlined text-4xl font-bold">close</span>
              </button>
            </div>
    
            <form className="flex flex-col gap-6 p-6" onSubmit={handleSubmit}>
              <div className="flex flex-col gap-2">
                <label className="font-label-bold text-deep-ink uppercase">Arena Name</label>
                <input 
                  className="w-full p-4 border-4 border-deep-ink bg-surface font-body-lg focus:outline-none focus:ring-0 focus:border-action-red transition-colors"
                  placeholder="e.g., WORD WIZARDS"
                  type="text"
                  value={data?.name}
                  onChange={e => setData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
    
              <div className="flex flex-col gap-2">
                <label className="font-label-bold text-deep-ink uppercase">Player Capacity</label>
                <select 
                  className="w-full p-4 border-4 border-deep-ink bg-surface font-body-lg focus:outline-none focus:ring-0 focus:border-action-red transition-colors"
                  value={data.capacity}
                  onChange={e => setData(prev => ({ ...prev, capacity: Number(e.target.value) }))}
                >
                  <option value={2}>2 Players</option>
                  <option value={4}>4 Players</option>
                  <option value={6}>6 Players</option>
                  <option value={8}>8 Players</option>
                  <option value={10}>10 Players</option>
                </select>
              </div>
               <label htmlFor="icon" className="font-label-bold text-deep-ink uppercase">Upload Icon<>(.svg,.png, .ico) only</></label>
            <input id="icon" className="w-full p-4 border-4 border-deep-ink bg-surface font-body-lg focus:outline-none focus:ring-0 focus:border-action-red transition-colors"
              type="file" accept="image/svg+xml,image/ico,image/png, .svg, .ico,.png" required
              onChange={e => {
                if (e.target.files[0]) {
                  setIcon(e.target.files[0]);
                }
              }}
            />
              <button 
                className="mt-4 bg-action-red text-paper-white py-6 border-4 border-deep-ink neubrutalism-shadow text-headline-md font-headline-md hover:scale-105 active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all uppercase" 
                type="submit"
              >
                START ARENA
              </button>
            </form>
    
          </div>
        </div>
      </>
    )
}