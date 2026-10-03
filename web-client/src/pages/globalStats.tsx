import { useState } from 'react';


export function GlobalStats() {
    return (
        <div className="bg-[#f9f9ff] text-[#171c26] overflow-x-hidden min-h-screen">
            {/* Injecting original custom CSS, fonts, and neubrutalist shadows */}
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@400;700;800&family=Space+Mono:wght@400;700&family=Inter:wght@400;500;700&display=swap');
                @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');

                .material-symbols-outlined {
                    font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 48;
                }
                .neubrutal-shadow {
                    box-shadow: 4px 4px 0px 0px rgba(18, 23, 33, 1);
                }
                .neubrutal-shadow-lg {
                    box-shadow: 8px 8px 0px 0px rgba(18, 23, 33, 1);
                }
                .neubrutal-shadow-hover:hover {
                    transform: translate(-2px, -2px);
                    box-shadow: 6px 6px 0px 0px rgba(18, 23, 33, 1);
                }
                .neubrutal-active:active {
                    transform: translate(2px, 2px);
                    box-shadow: 2px 2px 0px 0px rgba(18, 23, 33, 1);
                }
                body {
                    background-color: #f9f9ff;
                    font-family: 'Inter', sans-serif;
                }
                .bricolage {
                    font-family: 'Bricolage Grotesque', sans-serif;
                }
                .space-mono {
                    font-family: 'Space Mono', monospace;
                }
            `}</style>
            <main className="max-w-7xl mx-auto px-[16px] md:px-[40px] py-12">
                {/* Hall of Fame Section */}
                <section className="mb-16">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="bg-[#EC2513] text-[#FFFFFF] px-6 py-2 border-4 border-[#121721] neubrutal-shadow rotate-[-2deg]">
                            <h2 className="text-2xl font-black bricolage uppercase">Hall of Fame</h2>
                        </div>
                        <div className="h-[4px] flex-grow bg-[#121721] hidden md:block"></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Champ 1 */}
                        <div className="relative bg-[#BFE6F7] border-4 border-[#121721] p-6 neubrutal-shadow-lg transition-transform hover:-rotate-1">
                            <div className="absolute -top-6 -right-4 bg-[#ba0900] text-[#FFFFFF] p-2 border-4 border-[#121721] neubrutal-shadow rotate-12 z-10">
                                <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
                            </div>
                            <div className="flex flex-col items-center">
                                <div className="w-24 h-24 border-4 border-[#121721] bg-[#FFFFFF] mb-4 neubrutal-shadow">
                                    <img className="w-full h-full object-cover" alt="A detailed digital illustration of a cool gamer avatar with retro sunglasses and neon hair, set against a vibrant yellow background with thick black outlines, neubrutalist style with high contrast and saturated colors." src="https://lh3.googleusercontent.com/aida-public/AB6AXuDTCSWZe8ZYUf5dsfhCW0gfbp1Sj5a_Ya-spnP81EGmxNLicU9kOSabaEIbis5PC9_HlcXXP1K1SyFGqWfwdD-OT5toUDAIHNtLIfOeajlPOdxegivPqR626c4TbuyHQeq1IQFD6tsvegROevGNOM7QcMfomgn4nVnKlVZ9RMzHn46jkXSK2uNUvzm-5hmbUMs_XHh_-tqTabIMbanj0cD1Ilhv5D4dr2jNGcf7MNCGGR2ymxkaispe0U8chzSAEe3BguJiEnqTPBU3" />
                                </div>
                                <h3 className="text-2xl font-black bricolage text-[#121721] mb-1">VORTEX_99</h3>
                                <p className="space-mono text-sm uppercase bg-[#121721] text-[#FFFFFF] px-2 mb-4">Season 4 Champion</p>
                                <div className="w-full flex justify-between space-mono text-xs font-bold border-t-2 border-[#121721] pt-4">
                                    <span>WIN RATE: 94%</span>
                                    <span>WORDS: 12.4k</span>
                                </div>
                            </div>
                        </div>
                        {/* Champ 2 */}
                        <div className="relative bg-white border-4 border-[#121721] p-6 neubrutal-shadow-lg transition-transform hover:rotate-1">
                            <div className="absolute -top-4 -left-4 bg-[#3e6372] text-[#FFFFFF] p-2 border-4 border-[#121721] neubrutal-shadow -rotate-12 z-10">
                                <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>stars</span>
                            </div>
                            <div className="flex flex-col items-center">
                                <div className="w-24 h-24 border-4 border-[#121721] bg-[#BFE6F7] mb-4 neubrutal-shadow">
                                    <img className="w-full h-full object-cover" alt="A minimalist digital portrait of a professional e-sports player wearing a sleek headset, rendered in a bold pop-art style with heavy ink borders and vibrant primary colors. The character exudes focus and intensity." src="https://lh3.googleusercontent.com/aida-public/AB6AXuCVw1USCvY1UaNqCZuBXvaKH9Irtax-ah3EdjRdiT-d9Qu_ef-m3fSc8pNL5X5wY9oT9VACPLvzmq0CAP92kXCCNA3RUruxFkSN4iVeD__7PTdhUcekI3XcKWeRE1wtv1iVTT2OaT1gqdvJRmNFLhczUtsoVwVa5EThCStdEQWoij3vBl164QUrCf_ikvsrWw3dLHj-Bh6pNW3ojTkAgd6g1PVoXe4gvamjPfOsQI2HtAcKIjjKrVq8ok0BOBSI0EL5WGILdLtoE6l7" />
                                </div>
                                <h3 className="text-2xl font-black bricolage text-[#121721] mb-1">BRAIN_CELL</h3>
                                <p className="space-mono text-sm uppercase bg-[#EC2513] text-[#FFFFFF] px-2 mb-4">Season 3 Champion</p>
                                <div className="w-full flex justify-between space-mono text-xs font-bold border-t-2 border-[#121721] pt-4">
                                    <span>WIN RATE: 91%</span>
                                    <span>WORDS: 10.1k</span>
                                </div>
                            </div>
                        </div>
                        {/* Champ 3 */}
                        <div className="relative bg-[#e9edfc] border-4 border-[#121721] p-6 neubrutal-shadow-lg transition-transform hover:-rotate-1">
                            <div className="absolute -bottom-6 -right-2 bg-[#254c59] text-[#FFFFFF] p-2 border-4 border-[#121721] neubrutal-shadow rotate-6 z-10">
                                <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>military_tech</span>
                            </div>
                            <div className="flex flex-col items-center">
                                <div className="w-24 h-24 border-4 border-[#121721] bg-[#ffb4a7] mb-4 neubrutal-shadow">
                                    <img className="w-full h-full object-cover" alt="A stylized character avatar with a futuristic tech visor and streetwear hood, illustrated with thick black lines and bold block shading. The aesthetic is high-energy 90s arcade culture with a modern brutalist twist." src="https://lh3.googleusercontent.com/aida-public/AB6AXuBTKYNnBGlXfp8QCluTlnLmeKw9-YgpniYdmufXkZiF5U0w5LxV9N5U2RE24j3G05bXheQKZqTb9_8JUQZLz9RClvXyNkSj86HPSaNfmnSjLAHaQ2DQR1-C6udr-LCm4ZckmOsx1oiXIIIxVn4hLBH6e_4Y4cjc7jdNuSUWvN35KuiODtq1U2Xb7Ty1MFTziIf176_C8jD1KnloVgAqy595eOt_kWVMxpmkNV2ENGf1_Eyv69OWmMaY0GXJFez1IMgS6RzZWhwM8xa3" />
                                </div>
                                <h3 className="text-2xl font-black bricolage text-[#121721] mb-1">LEXI_CON</h3>
                                <p className="space-mono text-sm uppercase bg-[#3e6372] text-[#FFFFFF] px-2 mb-4">Season 2 Champion</p>
                                <div className="w-full flex justify-between space-mono text-xs font-bold border-t-2 border-[#121721] pt-4">
                                    <span>WIN RATE: 89%</span>
                                    <span>WORDS: 9.8k</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {}
                {/* Main Leaderboard */}
                <section>
                    <div className="bg-[#FFFFFF] border-4 border-[#121721] neubrutal-shadow-lg overflow-hidden">
                        <div className="bg-[#121721] text-[#FFFFFF] p-6 flex justify-between items-center">
                            <h2 className="text-3xl font-black bricolage uppercase tracking-tight">Global Rankings</h2>
                            <div className="flex gap-2">
                                <button className="bg-[#EC2513] text-[#FFFFFF] px-4 py-2 border-2 border-[#FFFFFF] space-mono text-sm font-bold neubrutal-shadow active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all">WEEKLY</button>
                                <button className="bg-[#FFFFFF] text-[#121721] px-4 py-2 border-2 border-[#121721] space-mono text-sm font-bold opacity-80 hover:opacity-100 transition-opacity">ALL-TIME</button>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-[#e9edfc] border-b-4 border-[#121721]">
                                    <tr className="space-mono text-sm font-bold uppercase">
                                        <th className="p-6 border-r-4 border-[#121721]">Rank</th>
                                        <th className="p-6 border-r-4 border-[#121721]">Player</th>
                                        <th className="p-6 border-r-4 border-[#121721] text-center">Words Unscrambled</th>
                                        <th className="p-6 text-center">Win Rate</th>
                                    </tr>
                                </thead>
                                <tbody className="bricolage text-xl">
                                    <PlayerRow
                                        rank="#01"
                                        name="CYBER_SCRIBE"
                                        imageSrc="https://lh3.googleusercontent.com/aida-public/AB6AXuBEqMELdqwUrAg7_kiclJb_14tVH38VjnhSvmtgxGPGVVwOF01MqBTBHBF61paRXboH3qTGM8EULY6QrmEen3dNgjxQFo2uEHupy2Dh6qu3jR4tTmwzdrswcDqRFHE4hwPa-jotjsrj0GzhQ23mkqW0dZpqBv9O0h3Ztxf4tmOvjEPaKqiZx1v3nuLUlv4LmlZUo2SQcX8P40q5HMbL9dLy7Ve7J10K0kxKy8aHp4gdVCmTjA7BkQM49q5Gf2U1VhxSVMaumzVaxLiI"
                                        imageAlt="A retro-pixelated gamer profile icon in a square frame with a thick black border."
                                        imageBg="bg-[#BFE6F7]"
                                        words="18,542"
                                        winRate="98.2%"
                                        winRateBg="bg-[#EC2513]"
                                    />
                                    <PlayerRow
                                        rank="#02"
                                        name="WORD_WIZARD"
                                        imageSrc="https://lh3.googleusercontent.com/aida-public/AB6AXuCrx3AVfLisZ_OlMW2BUssU0CCLClxRu_Yr0KVyrb0Gxb1seoGmYSOk4DsrhEO-VJWe297HZPxEtfcv7cHKaStnRCaE_lKh49hPnVnxU3nvATAFbhXz7PbheJiQwAJQ0vPjgu1MqXzVLPtA8pJ_1ygePLB93s9KpFpMV_YUHk-oQNVzIPA8Glub0kFLdqirCKrId3z-_h_EsBEoxUAaw4fBDeIbOyMqzeeFAFG7vhCG62JMg3YYKh-HJ7i3JGMeAH16BKXuuyQUh7QP"
                                        imageAlt="Detailed avatar of a young girl with bright green hair and holographic glasses."
                                        imageBg="bg-[#c2e9fa]"
                                        words="17,901"
                                        winRate="96.5%"
                                        winRateBg="bg-[#121721]"
                                    />
                                    <PlayerRow
                                        rank="#03"
                                        name="ALPHA_BET"
                                        imageSrc="https://lh3.googleusercontent.com/aida-public/AB6AXuDqEJ3-cAsTI45mhXbEDeg1Ky4LeUYGm8BSRorWjjttY_W19ajg7xrzlfKyg5kFFEfVZwYNAz8ZOmwJ6javV46h7MPy0GnzeIGPkUNW6LP1TOS9GXuuRKPjZWG56KbdJCnAMhl27WqF20XpGflvkmP-RtV8zEYdctA_QgC0q41xj0voZFms1fGu5z2SIFvmut4ZfxjgXCY-2YoWf4nWusFT06ely7cMUum4JT0P_z78URqHchIrwvHFtNKCjExJYu_45xmS81bZemHe"
                                        imageAlt="Stylized caricature of a man with a wild beard and artistic beret."
                                        imageBg="bg-[#ffdad4]"
                                        words="15,220"
                                        winRate="92.1%"
                                        winRateBg="bg-[#121721]"
                                    />
                                    <PlayerRow
                                        rank="#04"
                                        name="SCRAMBLE_QUEEN"
                                        imageSrc="https://lh3.googleusercontent.com/aida-public/AB6AXuBsOYuRGeWKMu6BmhsIHMD1UJaHMrXxrdZso7wdg6WbHdPCfRkwrSm83Qs3HCSfahkt1zE3SIJt3IijVCNwlsPbc0WIwB1yKOln_YIBmE2cKtJZdFAgrxOaIK5_8YGlhJQOgjbkMkbPW8g-vJB2a4_zh3H9wzLG54IIkM7mdIUU3sJrXbgNhdWiOrJ9ZymzqR4Ql7M-zaLo1b1ItZI5LGoBQ6AvemuBt1nvwl2y-wGU-lG6w8DrBTxUZ1lVKDr6uhjI7KqVTGlxv7o-"
                                        imageAlt="A cool urban female character with a beanie and multiple earrings."
                                        imageBg="bg-[#dee2f1]"
                                        words="14,888"
                                        winRate="90.4%"
                                        winRateBg="bg-[#121721]"
                                    />
                                    <PlayerRow
                                        rank="#YOU"
                                        isSpecial={true}
                                        name="PLAYER_ONE"
                                        imageSrc={null}
                                        imageAlt=""
                                        imageBg="bg-[#BFE6F7]"
                                        words="4,102"
                                        winRate="68.5%"
                                        winRateBg="bg-[#3e6372]"
                                    />
                                </tbody>
                            </table>
                        </div>
                        <div className="p-6 bg-[#e9edfc] border-t-4 border-[#121721] flex flex-col md:flex-row justify-between items-center gap-4">
                            <p className="space-mono font-bold">DISPLAYING TOP 50 PLAYERS</p>
                            <div className="flex gap-2">
                                <button className="w-12 h-12 border-4 border-[#121721] bg-[#FFFFFF] flex items-center justify-center neubrutal-shadow hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all">
                                    <span className="material-symbols-outlined">chevron_left</span>
                                </button>
                                <button className="w-12 h-12 border-4 border-[#121721] bg-[#EC2513] text-[#FFFFFF] flex items-center justify-center neubrutal-shadow hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all">
                                    <span className="material-symbols-outlined">chevron_right</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                {}
                {/* Stats Footer CTA */}
                <section className="mt-16 text-center">
                    <div className="relative inline-block group">
                        <div className="absolute inset-0 bg-[#121721] translate-x-3 translate-y-3 group-hover:translate-x-1 group-hover:translate-y-1 transition-transform"></div>
                        <button className="relative bg-[#EC2513] text-[#FFFFFF] px-12 py-6 border-4 border-[#121721] bricolage text-3xl font-black uppercase tracking-widest active:translate-x-3 active:translate-y-3 transition-transform">
                            Improve My Rank
                        </button>
                    </div>
                    <p className="mt-8 space-mono text-sm font-bold text-[#121721]/60 uppercase">Ready to climb the ladder? Start a new game now!</p>
                </section>
            </main>

            {/* Bottom Navigation (Mobile) */}
            <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center h-20 px-4 pb-safe bg-[#BFE6F7] border-t-4 border-[#121721] shadow-[0px_-4px_0px_0px_rgba(18,23,33,1)]">
                <div className="flex flex-col items-center justify-center text-[#121721] p-2">
                    <span className="material-symbols-outlined">home</span>
                    <span className="text-xs font-bold space-mono uppercase mt-1">Home</span>
                </div>
                <div className="flex flex-col items-center justify-center text-[#121721] p-2">
                    <span className="material-symbols-outlined">group</span>
                    <span className="text-xs font-bold space-mono uppercase mt-1">Lobby</span>
                </div>
                <div className="flex flex-col items-center justify-center text-[#121721] p-2">
                    <span className="material-symbols-outlined">videogame_asset</span>
                    <span className="text-xs font-bold space-mono uppercase mt-1">Play</span>
                </div>
                <div className="flex flex-col items-center justify-center bg-[#EC2513] text-[#FFFFFF] border-2 border-[#121721] rounded-lg px-4 py-1 translate-y-[-4px] shadow-[4px_4px_0px_0px_rgba(18,23,33,1)]">
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>trophy</span>
                    <span className="text-xs font-bold space-mono uppercase mt-1">Stats</span>
                </div>
            </nav>
        </div>
    );
}




// Helper component to manage the click micro-interaction for each row independently
const PlayerRow = ({ rank, isSpecial, name, imageSrc, imageAlt, imageBg, words, winRate, winRateBg }) => {
    const [isClicked, setIsClicked] = useState(false);

    const handleClick = () => {
        setIsClicked(true);
        // Remove the highlight class after 200ms to mimic the original JS behavior
        setTimeout(() => {
            setIsClicked(false);
        }, 200);
    };

    const baseRowClass = "border-b-4 border-[#121721] transition-colors cursor-pointer";
    const hoverClass = "hover:bg-[#BFE6F7]/20";
    const clickClass = isClicked ? "bg-[#BFE6F7]/30" : "";

    return (
        <tr className={`${baseRowClass} ${hoverClass} ${clickClass}`} onClick={handleClick}>
            <td className={`p-6 border-r-4 border-[#121721] font-black italic text-3xl ${isSpecial ? 'text-[#ba0900]' : ''}`}>
                {rank}
            </td>
            <td className="p-6 border-r-4 border-[#121721]">
                <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 border-2 border-[#121721] ${imageBg} flex-shrink-0 flex items-center justify-center`}>
                        {imageSrc ? (
                            <img className="w-full h-full object-cover" alt={imageAlt} src={imageSrc} />
                        ) : (
                            <span className="material-symbols-outlined text-3xl">person</span>
                        )}
                    </div>
                    <span className="font-bold">{name}</span>
                </div>
            </td>
            <td className="p-6 border-r-4 border-[#121721] text-center space-mono font-bold">
                {words}
            </td>
            <td className="p-6 text-center">
                <span className={`${winRateBg} text-[#FFFFFF] px-3 py-1 border-2 border-[#121721] font-bold space-mono`}>
                    {winRate}
                </span>
            </td>
        </tr>
    );
};
