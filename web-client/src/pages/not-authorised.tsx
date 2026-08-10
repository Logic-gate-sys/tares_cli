import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';


export function AccessDenied() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mascotBoxRef = useRef<HTMLDivElement>(null);
  const mascotNormalRef = useRef<HTMLImageElement>(null);
  const mascotAngryRef = useRef<HTMLImageElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const navigate = useNavigate(); 

  useEffect(() => {
    // We use gsap.context to ensure all animations are cleanly reverted on unmount
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();

      // Initial State: Hide angry mascot, stage the container off-screen
      gsap.set(mascotAngryRef.current, { autoAlpha: 0 });
      gsap.set(containerRef.current, { x: '-150vw' });

      // 1. Walk In
      tl.to(containerRef.current, {
        x: 0,
        duration: 1.5,
        ease: 'power3.out'
      })
        // 2. Pause briefly (0.5s)
        .to({}, { duration: 0.5 })
        // 3. Swap expressions and Flash eyes
        .addLabel('getAngry')
        .to(mascotNormalRef.current, { autoAlpha: 0, duration: 0.2 }, 'getAngry')
        .to(mascotAngryRef.current, { autoAlpha: 1, duration: 0.2 }, 'getAngry')
        .to(mascotBoxRef.current, {
          boxShadow: '0px 0px 20px rgba(236,37,19,0.8)',
          filter: 'brightness(1.5)',
          duration: 0.2,
          yoyo: true,
          repeat: 1
        }, 'getAngry')
        // 4. Infinite Angry Shake & Float
        .add(() => {
          // Mascot Shake & Float
          gsap.to(containerRef.current, {
            x: "random(-4, 4)",
            rotation: "random(-2, 2)",
            y: -12,
            duration: 0.1,
            yoyo: true,
            repeat: -1,
            ease: "none"
          });
          // Headline Shake
          gsap.to(headlineRef.current, {
            x: "random(-2, 2)",
            duration: 0.1,
            yoyo: true,
            repeat: -1,
            ease: "none"
          });
        });
    });

    return () => ctx.revert();
  }, []);

  return (
    <div className="bg-surface text-deep-ink min-h-screen flex flex-col font-body-md selection:bg-action-red selection:text-paper-white relative overflow-x-hidden">
      {/* Pattern Background for texture */}
      <div
        className="fixed inset-0 pointer-events-none z-0 opacity-[0.03]"
        style={{
          backgroundImage: 'radial-gradient(#121721 2px, transparent 2px)',
          backgroundSize: '24px 24px'
        }}
      />

      {/* Main Content Canvas */}
      <main className="flex-grow flex flex-col items-center justify-center p-margin-mobile md:p-margin-desktop relative z-10 w-full max-w-7xl mx-auto h-full min-h-screen">
        <div className="w-full max-w-3xl flex flex-col items-center text-center relative">

          {/* Decorative "Scrambled" floating elements */}
          <div className="absolute -top-12 -left-8 md:-left-16 w-16 h-16 bg-paper-white border-[3px] border-deep-ink shadow-[4px_4px_0px_0px_rgba(18,23,33,1)] flex items-center justify-center rounded-lg rotate-12 animate-pulse" style={{ animationDuration: '3s' }}>
            <span className="font-headline-lg text-headline-lg text-deep-ink">4</span>
          </div>
          <div className="absolute -bottom-16 -right-8 md:-right-16 w-16 h-16 bg-sky-blue border-[3px] border-deep-ink shadow-[4px_4px_0px_0px_rgba(18,23,33,1)] flex items-center justify-center rounded-lg -rotate-12">
            <span className="font-headline-lg text-headline-lg text-deep-ink">3</span>
          </div>
          <div className="absolute top-1/2 -right-4 w-12 h-12 bg-action-red border-[3px] border-deep-ink shadow-[4px_4px_0px_0px_rgba(18,23,33,1)] flex items-center justify-center rounded-lg rotate-45">
            <span className="font-headline-lg text-headline-lg text-paper-white">!</span>
          </div>

          {/* Mascot Graphic Container */}
          <div ref={containerRef} className="mb-lg relative inline-block">
            <div ref={mascotBoxRef} className="w-40 h-40 md:w-56 md:h-56 bg-paper-white border-[4px] border-deep-ink rounded-xl shadow-[8px_8px_0px_0px_rgba(236,37,19,1)] flex items-center justify-center overflow-hidden relative z-10 p-2 transition-colors duration-300">
              <div className="relative w-full h-full">
                <img
                  ref={mascotNormalRef}
                  alt="TARES Mascot"
                  className="absolute top-0 left-0 w-full h-full object-contain"
                  src="https://lh3.googleusercontent.com/aida/AP1WRLuxlzEuUY6xCW9kNeOo1cztNCLkokIyp2JNbTDSbJVaSpqX_NyJwj9J3zGvbDGwxxjV4Fn3SZWCmpLNK2ioBGCBJKd-AiWkYzUDs9DgyNoBimXL0RZ7a1cjIo1cYcK6SlQkH5Ne9IHrWOSyQbwKQsaYT1ctZ202p6nmjg3CQl0XFr7UfSc5ozxNrmvwRZaKIgihCmzDrSfABB676WD0Yxxfo0fyEvrIuDRcR1CN-m6dHYO-jwOQSI0d5PQ"
                />
                <img
                  ref={mascotAngryRef}
                  alt="TARES Mascot Angry"
                  className="absolute top-0 left-0 w-full h-full object-contain"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuA5mc0iVys_NTfYWkymWpAZSaQokhGAX2n86DOh14MDalQbQ12i8AUElq4h2T7KZkAW6yc1OErRyuP46GJrc_aY37QAQ8yggez4zeOWJj6RomIaOlV_QWWyxI6Ub3EHfoebGMiy4B9z2ee5QHMM63EGp0XjYwRsGs3cJERTGKMg_iuCz6GnK4aK9gIKv2qKRDXMjmLsj-Nurm4s6S5bNcGvvdcu2KuSQcgpJUSGSrb2L4q5mh5tv7vlNw"
                />
              </div>
            </div>
          </div>

          <h1 ref={headlineRef} className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-deep-ink mb-md uppercase tracking-tight relative inline-block">
            <span className="bg-action-red text-paper-white px-2 py-1 border-[4px] border-deep-ink shadow-[6px_6px_0px_0px_rgba(18,23,33,1)] block md:inline-block transform -rotate-1 mb-2 md:mb-0">SCRAMBLE</span>
            <span className="block md:inline-block mt-2 md:mt-0 px-2 py-1 bg-paper-white border-[4px] border-deep-ink shadow-[6px_6px_0px_0px_rgba(18,23,33,1)] transform rotate-1">HALTED</span>
          </h1>

          <p className="font-body-lg text-body-lg text-deep-ink max-w-3xl mx-auto mb-xl bg-paper-white p-4 border-[3px] border-deep-ink shadow-[4px_4px_0px_0px_rgba(18,23,33,1)]">
            You do not have the necessary credentials to enter this arena. The words here are classified.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 w-full justify-center max-w-md mx-auto">
            <button onClick={() => navigate("/")} className="w-full sm:w-auto font-headline-md text-headline-md text-paper-white bg-action-red px-8 py-4 border-[3px] border-deep-ink shadow-[8px_8px_0px_0px_rgba(18,23,33,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[10px_10px_0px_0px_rgba(18,23,33,1)] transition-all active:translate-x-[8px] active:translate-y-[8px] active:shadow-none flex items-center justify-center gap-2">
              <span className="material-symbols-outlined font-bold" style={{ fontVariationSettings: "'FILL' 1" }}>
                arrow_back
              </span>
              BACK TO HOME
            </button>
            <button onClick={()=>navigate(-1)} className="w-full sm:w-auto font-headline-md text-headline-md text-deep-ink bg-sky-blue px-8 py-4 border-[3px] border-deep-ink shadow-[8px_8px_0px_0px_rgba(18,23,33,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[10px_10px_0px_0px_rgba(18,23,33,1)] transition-all active:translate-x-[8px] active:translate-y-[8px] active:shadow-none">
              GO BACK
            </button>
          </div>

          {/* Error Code Pill */}
          <div className="mt-xl inline-block">
            <span className="font-label-mono text-label-mono bg-deep-ink text-paper-white px-4 py-2 rounded-full border-2 border-action-red uppercase tracking-wider">
              Error_Code: 403_Forbidden
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}
