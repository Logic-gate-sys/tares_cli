import { useState, useEffect } from 'react';

const SYMBOLS = ['sports_esports', 'terminal', 'bolt', 'casino'];
const initdata = {
  name: 'CYBERPUNK CITY',
  isOnline: true,
  capacity: 8,
  symbol: 'sports_esports',
}

export const SettingsModal = ({ onClose, initialData = initdata, onSave }) => {
  const [arenaName, setArenaName] = useState(initialData.name);
  const [isOnline, setIsOnline] = useState(initialData.isOnline);
  const [capacity, setCapacity] = useState(initialData.capacity);
  const [selectedSymbol, setSelectedSymbol] = useState(initialData.symbol);

  const handleSave = () => {
    onSave?.({
      name: arenaName,
      isOnline,
      capacity,
      symbol: selectedSymbol,
    });
    onClose();
  };
  return (
    <div className="fixed inset-0 z-100 bg-deep-ink/80  backdrop-blur-sm flex items-center justify-center p-2">
      <div className="bg-paper-white rounded-2xl neubrutalism-border p-6 neubrutalism-shadow max-w-2xl w-full mx-4 max-h-full overflow-y-auto custom-scrollbar">
        {/* Modal Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-headline-md font-headline-md text-deep-ink">
            ROOM CONFIGURATION
          </h2>
          <button
            onClick={onClose}
            className="w-10 h-10 bg-action-red text-paper-white neubrutalism-border flex items-center justify-center hover:bg-deep-ink transition-colors btn-active-sm"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="space-y-6">
          {/* Arena Name */}
          <div className="space-y-2">
            <label className="font-label-bold text-deep-ink block">
              ARENA NAME
            </label>
            <input
              className="w-full bg-surface-container-low neubrutalism-border p-3 font-body-md text-deep-ink focus:outline-none focus:ring-4 focus:ring-sky-blue"
              type="text"
              value={arenaName}
              onChange={(e) => setArenaName(e.target.value)}
            />
          </div>

          {/* Status Toggle */}
          <div className="space-y-2 flex justify-between items-center bg-surface-container p-4 neubrutalism-border">
            <label className="font-label-bold text-deep-ink mb-0">
              ARENA STATUS
            </label>
            <div className="flex items-center gap-2 bg-paper-white neubrutalism-border p-1 rounded-lg">
              <button
                type="button"
                onClick={() => setIsOnline(true)}
                className={`${isOnline
                  ? 'bg-action-red text-paper-white'
                  : 'bg-transparent text-deep-ink'
                  } px-4 py-2 border-2 border-transparent text-sm font-label-bold active:scale-95 transition-transform`}
              >
                ONLINE
              </button>
              <button
                type="button"
                onClick={() => setIsOnline(false)}
                className={`${!isOnline
                  ? 'bg-deep-ink text-paper-white'
                  : 'bg-transparent text-deep-ink'
                  } px-4 py-2 border-2 border-transparent text-sm font-label-bold active:scale-95 transition-transform`}
              >
                OFFLINE
              </button>
            </div>
          </div>

          {/* Capacity Slider */}
          <div className="space-y-2">
            <label className="font-label-bold text-deep-ink block">
              CAPACITY (2-16)
            </label>
            <input
              className="w-full accent-action-red h-2 bg-deep-ink rounded-lg appearance-none cursor-pointer"
              max="16"
              min="2"
              type="range"
              value={capacity}
              onChange={(e) => setCapacity(Number(e.target.value))}
            />
            <div className="flex justify-between text-label-mono font-bold">
              <span>2</span>
              <span className="text-action-red">{capacity} PLAYERS</span>
              <span>16</span>
            </div>
          </div>

          {/* Symbol Selector */}
          <div className="space-y-2">
            <label className="font-label-bold text-deep-ink block">
              SYMBOL
            </label>
            <div className="grid grid-cols-4 gap-4">
              {SYMBOLS.map((sym) => {
                const isSelected = selectedSymbol === sym;
                return (
                  <button
                    key={sym}
                    type="button"
                    onClick={() => setSelectedSymbol(sym)}
                    className={`aspect-square ${isSelected ? 'bg-action-red text-paper-white' : 'bg-surface-container text-deep-ink hover:bg-sky-blue'} neubrutalism-border flex items-center justify-center hover:scale-105 transition-all neubrutalism-shadow-sm btn-active-sm`}
                  >
                    <span className="material-symbols-outlined text-2xl">
                      {sym}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            className="w-full bg-sky-blue text-deep-ink py-4 neubrutalism-border font-label-bold hover:bg-action-red hover:text-paper-white transition-colors neubrutalism-shadow btn-active mt-4"
          >
            SAVE CONFIGURATION
          </button>
        </div>
      </div>
    </div>
  );
}



// import React, { useState, useEffect } from 'react';

// const SYMBOL_OPTIONS = [
//   'sports_esports',
//   'terminal',
//   'bolt',
//   'casino'
// ];

// export default function SettingsModal({
//   isOpen,
//   onClose,
//   onSave,
//   initialData = {
//     name: 'CYBERPUNK CITY',
//     isOnline: true,
//     capacity: 8,
//     symbol: 'sports_esports'
//   }
// }) {
//   const [arenaName, setArenaName] = useState(initialData.name);
//   const [isOnline, setIsOnline] = useState(initialData.isOnline);
//   const [capacity, setCapacity] = useState(initialData.capacity);
//   const [selectedSymbol, setSelectedSymbol] = useState(initialData.symbol);

//   useEffect(() => {
//     if (isOpen) {
//       setArenaName(initialData.name);
//       setIsOnline(initialData.isOnline);
//       setCapacity(initialData.capacity);
//       setSelectedSymbol(initialData.symbol);
//     }
//   }, [isOpen, initialData]);

//   if (!isOpen) return null;

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     onSave?.({
//       name: arenaName,
//       isOnline,
//       capacity,
//       symbol: selectedSymbol
//     });
//     onClose();
//   };

//   return (
//     <div className="fixed inset-0 z-[100] bg-deep-ink/80 backdrop-blur-sm flex items-center justify-center p-4">
//       <div className="bg-paper-white neubrutalism-border p-8 neubrutalism-shadow max-w-lg w-full max-h-[90vh] overflow-y-auto custom-scrollbar">
//         {/* Modal Header */}
//         <div className="flex justify-between items-center mb-6">
//           <h2 className="text-headline-md font-headline-md text-deep-ink">
//             ROOM CONFIGURATION
//           </h2>
//           <button
//             type="button"
//             onClick={onClose}
//             className="w-10 h-10 bg-action-red text-paper-white neubrutalism-border flex items-center justify-center hover:bg-deep-ink transition-colors btn-active-sm cursor-pointer"
//           >
//             <span className="material-symbols-outlined">close</span>
//           </button>
//         </div>

//         <form onSubmit={handleSubmit} className="space-y-6">
//           {/* Arena Name Input */}
//           <div className="space-y-2">
//             <label className="block font-label-bold text-deep-ink">
//               ARENA NAME
//             </label>
//             <input
//               type="text"
//               value={arenaName}
//               onChange={(e) => setArenaName(e.target.value)}
//               className="w-full bg-surface-container-low neubrutalism-border p-3 font-body-md text-deep-ink focus:outline-none focus:ring-4 focus:ring-sky-blue"
//             />
//           </div>

//           {/* Status Toggle */}
//           <div className="space-y-2 flex justify-between items-center bg-surface-container p-4 neubrutalism-border">
//             <label className="font-label-bold text-deep-ink mb-0">
//               ARENA STATUS
//             </label>
//             <div className="flex items-center gap-2 bg-paper-white neubrutalism-border p-1 rounded-lg">
//               <button
//                 type="button"
//                 onClick={() => setIsOnline(true)}
//                 className={`px-4 py-2 border-2 border-transparent text-sm font-label-bold active:scale-95 transition-transform cursor-pointer ${
//                   isOnline
//                     ? 'bg-action-red text-paper-white'
//                     : 'bg-transparent text-deep-ink'
//                 }`}
//               >
//                 ONLINE
//               </button>
//               <button
//                 type="button"
//                 onClick={() => setIsOnline(false)}
//                 className={`px-4 py-2 border-2 border-transparent text-sm font-label-bold active:scale-95 transition-transform cursor-pointer ${
//                   !isOnline
//                     ? 'bg-deep-ink text-paper-white'
//                     : 'bg-transparent text-deep-ink'
//                 }`}
//               >
//                 OFFLINE
//               </button>
//             </div>
//           </div>

//           {/* Capacity Range Slider */}
//           <div className="space-y-2">
//             <label className="block font-label-bold text-deep-ink">
//               CAPACITY (2-16)
//             </label>
//             <input
//               type="range"
//               min="2"
//               max="16"
//               value={capacity}
//               onChange={(e) => setCapacity(Number(e.target.value))}
//               className="w-full accent-action-red h-2 bg-deep-ink rounded-lg appearance-none cursor-pointer"
//             />
//             <div className="flex justify-between text-label-mono font-bold">
//               <span>2</span>
//               <span className="text-action-red">{capacity} PLAYERS</span>
//               <span>16</span>
//             </div>
//           </div>

//           {/* Symbol Selection Grid */}
//           <div className="space-y-2">
//             <label className="block font-label-bold text-deep-ink">
//               SYMBOL
//             </label>
//             <div className="grid grid-cols-4 gap-4">
//               {SYMBOL_OPTIONS.map((sym) => {
//                 const isSelected = selectedSymbol === sym;
//                 return (
//                   <button
//                     key={sym}
//                     type="button"
//                     onClick={() => setSelectedSymbol(sym)}
//                     className={`aspect-square neubrutalism-border flex items-center justify-center transition-all hover:scale-105 neubrutalism-shadow-sm btn-active-sm cursor-pointer ${
//                       isSelected
//                         ? 'bg-action-red text-paper-white'
//                         : 'bg-surface-container text-deep-ink hover:bg-sky-blue'
//                     }`}
//                   >
//                     <span className="material-symbols-outlined text-3xl">
//                       {sym}
//                     </span>
//                   </button>
//                 );
//               })}
//             </div>
//           </div>

//           {/* Save Action Button */}
//           <button
//             type="submit"
//             className="w-full bg-sky-blue text-deep-ink py-4 neubrutalism-border font-label-bold hover:bg-action-red hover:text-paper-white transition-colors neubrutalism-shadow btn-active mt-4 cursor-pointer"
//           >
//             SAVE CONFIGURATION
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// }
