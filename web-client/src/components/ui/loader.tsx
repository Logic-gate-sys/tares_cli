import React from "react";

interface LoaderProps {
  text?: string;
}

export const Loader: React.FC<LoaderProps> = ({ text }) => {
  return (
    <div className="bg-surface text-on-surface min-h-screen flex flex-col items-center justify-center p-4">
      <style>
        {`
          /* Arena Loader Animations */
          @keyframes jitter {
              0% { transform: translate(0, 0); }
              10% { transform: translate(-2px, 2px); }
              20% { transform: translate(2px, -2px); }
              30% { transform: translate(-2px, -2px); }
              40% { transform: translate(2px, 2px); }
              50% { transform: translate(0, 0); }
              100% { transform: translate(0, 0); }
          }

          .text-jitter {
              animation: jitter 3s infinite steps(2);
          }

          @keyframes fill-glitch {
              0% { width: 0%; opacity: 1; }
              20% { width: 25%; opacity: 0.8; }
              22% { width: 25%; opacity: 0; }
              25% { width: 25%; opacity: 1; }
              40% { width: 50%; }
              60% { width: 75%; opacity: 1; }
              62% { width: 70%; opacity: 0.5; }
              65% { width: 75%; opacity: 1; }
              100% { width: 100%; }
          }

          .bar-fill {
              animation: fill-glitch 4s infinite linear;
          }

          @keyframes blink {
              0%, 100% { opacity: 1; }
              50% { opacity: 0; }
          }

          .glitch-block {
              animation: blink 0.5s infinite step-end;
          }
          .glitch-block:nth-child(even) {
              animation-delay: 0.2s;
          }

          /* Neubrutalism Utilities */
          .brutal-shadow {
              box-shadow: 8px 8px 0px 0px #121721;
          }
          .brutal-border {
              border: 3px solid #121721;
          }
        `}
      </style>

      <div className="w-full max-w-md flex flex-col items-center justify-center">
        <div className="font-headline-lg text-headline-lg text-action-red mb-4 text-jitter uppercase tracking-tighter">
          {text ?? "Loading..."}
        </div>

        {/* The Arena Loader Element */}
        <div className="w-full h-12 brutal-border bg-sky-blue relative overflow-hidden p-[2px]">
          {/* Background Grid Pattern */}
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                "repeating-linear-gradient(45deg, transparent, transparent 10px, #121721 10px, #121721 12px)",
            }}
          ></div>

          {/* Filling Bar */}
          <div className="bar-fill h-full bg-action-red brutal-border relative flex items-center justify-end overflow-hidden">
            {/* Glitching leading edge */}
            <div className="flex h-full border-l-2 border-deep-ink bg-paper-white w-4">
              <div className="w-1/2 h-full bg-deep-ink glitch-block"></div>
              <div className="w-1/2 h-full bg-action-red glitch-block"></div>
            </div>
          </div>
        </div>

        <div className="mt-2 font-label-bold text-label-bold text-deep-ink flex w-full justify-between">
          <span>SYS.INIT</span>
          <span className="animate-pulse">SCRAMBLING_DATA_</span>
        </div>
      </div>
    </div>
  );
};