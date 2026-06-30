import { Rocket } from "lucide-react";
import { MiniMerch } from "#components/mini-merch-nav";

interface LetterTile {
    letter: string;
    top: string;
    left: string;
    rotate: string;
    duration: string;
}

const FLYING_LETTERS: LetterTile[] = [
    {
        letter: "A",
        top: "26%",
        left: "22%",
        rotate: "-12deg",
        duration: "3.9s",
    },
    { letter: "X", top: "87%", left: "9%", rotate: "-21deg", duration: "3.9s" },
    { letter: "Q", top: "11%", left: "33%", rotate: "-15deg", duration: "5s" },
    {
        letter: "Q",
        top: "49%",
        left: "53%",
        rotate: "-24deg",
        duration: "4.7s",
    },
    { letter: "E", top: "2%", left: "59%", rotate: "-21deg", duration: "3.7s" },
    { letter: "E", top: "58%", left: "36%", rotate: "29deg", duration: "5.7s" },
    { letter: "Z", top: "30%", left: "17%", rotate: "0.9deg", duration: "6s" },
    { letter: "X", top: "9%", left: "84%", rotate: "20deg", duration: "5.8s" },
    {
        letter: "R",
        top: "44%",
        left: "14%",
        rotate: "-27deg",
        duration: "3.5s",
    },
    {
        letter: "S",
        top: "44%",
        left: "84%",
        rotate: "-13deg",
        duration: "3.5s",
    },
];
export function Hero() {
    return (
        <>
            <section className="relative min-h-[85vh] flex flex-col items-center justify-center px-4 text-center overflow-hidden py-12">
                {/* FLYING LETTER BLOCKS */}
                <div className="absolute inset-0 z-0">
                    {FLYING_LETTERS.map((item, index) => (
                        <div
                            key={index}
                            className="absolute flex items-center justify-center bg-white border-[3px] border-[#121721] w-12 h-12 md:w-16 md:h-16 rounded-xl neubrutal-shadow text-2xl font-bold pointer-events-none opacity-20"
                            style={{
                                top: item.top,
                                left: item.left,
                                transform: `rotate(${item.rotate})`,
                                animation: `float ${item.duration} ease-in-out infinite`,
                            }}
                        >
                            {item.letter}
                        </div>
                    ))}
                </div>

                <div className="relative z-10 max-w-5xl mx-auto">
                    <div className="inline-block bg-[#BFE6F7] border-4 border-[#121721] px-4 py-2 mb-8 rotate-[-3deg] neubrutal-shadow">
                        <span className="font-mono font-bold text-sm uppercase tracking-widest text-[#121721]">
                            Word Scramble Royale
                        </span>
                    </div>
                    <h1 className="text-6xl md:text-8xl font-black uppercase italic text-[#EC2513] rotate-[1deg] leading-none mb-10 drop-shadow-[4px_4px_0px_#121721]">
                        TARES
                    </h1>
                    <p className="text-xl font-medium max-w-2xl mx-auto mb-14 bg-white p-6 border-4 border-[#121721] neubrutal-shadow-lg">
                        Unscramble, compete, and climb the ranks in the world's
                        most chaotic multiplayer word game. Fast minds win, slow
                        ones get scrambled.
                    </p>
                    <button className="group relative inline-flex items-center gap-4 font-bold text-2xl bg-[#EC2513] text-white px-12 py-6 border-4 border-[#121721] neubrutal-shadow-xl hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[16px_16px_0px_0px_#121721] transition-all active:translate-x-1 active:translate-y-1 active:shadow-none">
                        PLAY NOW
                        <Rocket className="w-8 h-8 fill-current" />
                    </button>
                </div>
                <MiniMerch />
            </section>
        </>
    );
}
