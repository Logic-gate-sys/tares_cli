import { useState, useEffect } from "react";

type ChallengerNotificationProps = {
  message?: string;
  duration?: number; // How long it stays visible (default: 3000ms)
  onExited?: () => void; // Optional callback when the notification disappears
};

export function Notification({
  message = "NEW CHALLENGER HAS ENTERED THE ARENA!",
  duration = 5000,
  onExited,
}: ChallengerNotificationProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Step 1: Wait for the main duration to trigger the exit animation transition
    const exitAnimationTimeout = setTimeout(() => {
      setIsExiting(true);

      // Step 2: Wait 500ms for the CSS slide/fade-out transition to complete before unmounting
      const unmountTimeout = setTimeout(() => {
        setIsVisible(false);
        if (onExited) onExited();
      }, 500);

      return () => clearTimeout(unmountTimeout);
    }, duration);

    return () => clearTimeout(exitAnimationTimeout);
  }, [duration, onExited]);

  if (!isVisible) return null;

  return (
    <div
      className={`
        fixed bottom-24 left-1/2 -translate-x-1/2 z-50 
        flex items-center gap-4 bg-paper-white border-4 border-deep-ink p-4 
        neubrutalism-shadow transition-all duration-500 ease-in
        ${isExiting ? "opacity-0 translate-y-4 scale-95 pointer-events-none" : "animate-bounce"}
      `}
    >
      {/* Flashing Arena Light */}
      <div className="bg-action-red w-4 h-4 rounded-full border-2 border-deep-ink animate-pulse"></div>
      
      <p className="font-headline-md text-deep-ink font-bold uppercase text-sm md:text-base whitespace-nowrap">
        {message}
      </p>
    </div>
  );
}