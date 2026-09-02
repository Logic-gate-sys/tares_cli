


export const DeleteModal = ({ onClose, onConfirm }) => {
  const title = "DELETE ARENA?";
  const description = "This action cannot be undone. All current players will be kicked.";

  return (
    <div className="fixed inset-0 z-100 bg-deep-ink/80  backdrop-blur-sm flex items-center justify-center p-2">
      <div className="bg-paper-white neubrutalism-border p-8 neubrutalism-shadow max-w-2xl w-full rounded-xl">
        <div className="flex flex-col items-center text-center gap-6">
          <span className="material-symbols-outlined text-6xl text-action-red" style={{ fontVariationSettings: '"FILL" 1' }}>
            warning
          </span>

          <h2 className="text-headline-md font-headline-md text-deep-ink">{title}</h2>

          <p className="text-body-md text-secondary"> {description} </p>

          <div className="flex gap-4 w-full mt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-sky-blue text-deep-ink py-4 neubrutalism-border font-label-bold hover:bg-paper-white transition-colors neubrutalism-shadow-sm btn-active-sm cursor-pointer"
            >
              CANCEL
            </button>
            <button
              type="button"
              onClick={() => {
                onConfirm?.();
                onClose();
              }}
              className="flex-1 bg-action-red text-paper-white py-4 neubrutalism-border font-label-bold hover:bg-deep-ink transition-colors neubrutalism-shadow-sm btn-active-sm cursor-pointer"
            >
              CONFIRM DELETE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}




// export const  DeleteModal= ({ onClose, onConfirm }) =>{
//   return (
//     <div className="fixed inset-0 z-99 modal-overlay flex items-center justify-center">
//       <div className="w-full bg-paper-white neubrutalism-border p-8 neubrutalism-shadow max-w-md  mx-4">
//         <div className="w-full flex flex-col items-center text-center gap-6 p-4 ">
//           <span className="material-symbols-outlined text-6xl text-action-red">
//             warning
//           </span>
//           <h2 className="text-headline-md font-headline-md text-deep-ink">
//             DELETE ARENA?
//           </h2>
//           <p className="text-body-md text-secondary">
//             This action cannot be undone. All current players will be kicked.
//           </p>
//           <div className="flex gap-4 w-full mt-4">
//             <button
//               onClick={onClose}
//               className="flex-1 bg-sky-blue text-deep-ink py-4 neubrutalism-border font-label-bold hover:bg-paper-white transition-colors neubrutalism-shadow-sm btn-active-sm"
//             >
//               CANCEL
//             </button>
//             <button
//               onClick={() => {
//                 onConfirm?.();
//                 onClose();
//               }}
//               className="flex-1 bg-action-red text-paper-white py-4 neubrutalism-border font-label-bold hover:bg-deep-ink transition-colors neubrutalism-shadow-sm btn-active-sm"
//             >
//               CONFIRM DELETE
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
