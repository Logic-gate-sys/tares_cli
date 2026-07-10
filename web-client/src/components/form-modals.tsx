import type { ClientMessage } from "#types/messages";
import { useState, type FormEvent } from "react"

// Cleaned up the types so TypeScript knows exactly what to expect
type FormModalProps = {
  onSubmit: (data:ClientMessage) => void;
  onClose?: () => void; // Added an optional close handler for your X button
}

export function CreateRoomModal({ onSubmit, onClose }: FormModalProps) {
  // Use a strict type instead of Record<string, unknown> to catch typos early
  const [data, setData] = useState({
    name: '',
    capacity: 2 // default matching your first select option
  })

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault(); // Stops the page from refreshing
    if (!data.name.trim()) return; // Optional: basic validation to ensure a name exists
    
    onSubmit({
      type: 'inlobby_msg',
      payload: {action:'CREATE_ROOM', value:{name: data.name, capacity: data.capacity}}
    });
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
                  value={data.name}
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