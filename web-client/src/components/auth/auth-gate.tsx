import React, { useState, useMemo } from "react";
import { useAuth } from "#hooks/use-auth";
import type { LoginRequest, SignupRequest } from "#types/type";
import { NavigationBar } from "#components/home/navigation-bar";
import { Footer } from "#components/footer";

interface ScatteredLetter {
    id: number;
    char: string;
    top: string;
    left: string;
    rotate: string;
}
interface AuthGateProps {
    children: React.ReactNode;
}

export function AuthGate({ children }: AuthGateProps) {
    const { state, login, signup } = useAuth();
    const [mode, setMode] = useState<"login" | "signup">("login");
    // Controlled form states
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    // 1. Memoize randomized decorative letter nodes to prevent layout shifts on recalculation
    const backgroundLetters = useMemo<ScatteredLetter[]>(() => {
        const pool = ["A", "E", "R", "S", "T", "L", "I", "O"];
        return pool.map((char, idx) => ({
            id: idx,
            char,
            top: `${5 + Math.random() * 85}%`,
            left: `${2 + Math.random() * 95}%`,
            rotate: `${Math.random() * 60 - 30}deg`,
        }));
    }, []);
    // 2. Form submission / loading simulator
    const handleSubmitAction = async (e: React.ChangeEvent) => {
        e.preventDefault();
        if (mode === "login") {
            const data: LoginRequest = { email, password };
            await login(data);
        } else if (mode === "signup") {
            const data: SignupRequest = { email, username, password };
            await signup(data);
        }
    };

    // 3. Dynamic typing animation logic
    const handleKeyDownAnimation = (
        e: React.KeyboardEvent<HTMLInputElement>,
    ) => {
        if (e.key.length > 1 && e.key !== " ") return;

        const char = e.key;
        const inputElement = e.currentTarget;
        const rect = inputElement.getBoundingClientRect();

        // Spawn a ghost text element
        const ghost = document.createElement("div");
        ghost.className = "ghost-letter";
        ghost.textContent = char;

        // Apply exact custom styles dynamically
        ghost.style.position = "fixed";
        ghost.style.pointerEvents = "none";
        ghost.style.zIndex = "1000";
        ghost.style.fontFamily = '"Bricolage Grotesque", sans-serif';
        ghost.style.fontWeight = "800";
        ghost.style.color = "#121721";
        ghost.style.textShadow = "2px 2px 0px rgba(18, 23, 33, 0.2)";
        ghost.style.fontSize = "20px";
        ghost.style.transition =
            "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)";
        ghost.style.textTransform = "uppercase";

        // Start coordinates: bottom viewport frame edge
        const startX = Math.random() * window.innerWidth;
        const startY = window.innerHeight + 50;

        ghost.style.left = `${startX}px`;
        ghost.style.top = `${startY}px`;
        ghost.style.transform = `rotate(${Math.random() * 360}deg) scale(2)`;

        document.body.appendChild(ghost);

        // Calculate alignment positioning matrices based on input length attributes
        const charWidth = 10;
        const paddingLeft = 16;
        const currentLength = inputElement.value.length;
        const targetX = rect.left + paddingLeft + currentLength * charWidth;
        const targetY = rect.top + rect.height / 2 - 10;

        // FIX 1: Safely capture the original text color only once
        if (!inputElement.dataset.originalColor) {
            const computedColor = window.getComputedStyle(inputElement).color;
            // Safeguard against capturing "transparent" if anything goes wrong
            inputElement.dataset.originalColor =
                computedColor !== "transparent" &&
                computedColor !== "rgba(0, 0, 0, 0)"
                    ? computedColor
                    : "#121721";
        }

        // FIX 2: Increment tracking counter for active character animations
        const activeAnims =
            parseInt(inputElement.dataset.activeAnims || "0", 10) + 1;
        inputElement.dataset.activeAnims = activeAnims.toString();

        requestAnimationFrame(() => {
            ghost.style.left = `${targetX}px`;
            ghost.style.top = `${targetY}px`;
            ghost.style.transform = "rotate(0deg) scale(1)";

            inputElement.style.color = "transparent";

            setTimeout(() => {
                ghost.style.opacity = "0";

                // Decrement active animation count
                const currentAnims =
                    parseInt(inputElement.dataset.activeAnims || "0", 10) - 1;
                inputElement.dataset.activeAnims = currentAnims.toString();

                // Only restore the true color if no other letter streams are landing
                if (currentAnims <= 0) {
                    inputElement.style.color =
                        inputElement.dataset.originalColor || "";
                    inputElement.removeAttribute("data-original-color");
                    inputElement.removeAttribute("data-active-anims");
                }

                setTimeout(() => ghost.remove(), 100);
            }, 400);
        });
    };

    // trial
    if (state.status !== "is-authenticated") {
        return <>{children}</>
    }
    return (
        <div className="bg-background h-full  text-on-background min-h-screen flex flex-col font-body-md overflow-x-hidden">
            <NavigationBar/>
            <main className="flex-grow flex items-center justify-center relative py-xl px-margin-mobile">
                {/* Structural Floating Badges */}
                <div className="absolute top-20 left-10 sticker-float hidden lg:block">
                    <div className="bg-sky-blue border-2 border-deep-ink p-4 rotate-[-12deg] neubrutalist-shadow flex items-center justify-center">
                        <span
                            className="material-symbols-outlined text-4xl"
                            style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                            bolt
                        </span>
                    </div>
                </div>

                <div
                    className="absolute bottom-20 right-10 sticker-float hidden lg:block"
                    style={{ animationDelay: "-1.5s" }}
                >
                    <div className="bg-action-red border-2 border-deep-ink p-4 rotate-[12deg] neubrutalist-shadow flex items-center justify-center">
                        <span
                            className="material-symbols-outlined text-4xl text-paper-white"
                            style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                            trophy
                        </span>
                    </div>
                </div>

                <div
                    className="absolute top-1/4 right-20 sticker-float hidden xl:block"
                    style={{ animationDelay: "-0.7s" }}
                >
                    <div className="bg-paper-white border-2 border-deep-ink p-3 rotate-[5deg] neubrutalist-shadow text-label-bold">
                        LETTERS!
                    </div>
                </div>

                {/* Scattered Dynamic Typography Stubs */}
                {backgroundLetters.map((letter) => (
                    <div
                        key={letter.id}
                        className="absolute hidden md:flex items-center justify-center bg-paper-white border-2 border-deep-ink w-10 h-10 md:w-12 md:h-12 rounded-lg neubrutalist-shadow font-headline-md pointer-events-none opacity-20 lg:opacity-100 transition-all duration-700"
                        style={{
                            top: letter.top,
                            left: letter.left,
                            transform: `rotate(${letter.rotate})`,
                            zIndex: 0,
                        }}
                    >
                        {letter.char}
                    </div>
                ))}

                {/* Modular Interactive Access Panel Block */}
                <section className="w-full max-w-2xl bg-sky-blue border-[4px] border-deep-ink p-lg md:p-xl relative neubrutalist-shadow-large mode-transition z-10">
                    {/* Card Label */}
                    <div className="absolute top-6 left-1/2 translate-x-1/2 bg-deep-ink text-paper-white px-md py-xs border-[3px] border-deep-ink font-label-bold uppercase whitespace-nowrap transition-all">
                        {mode === "signup" ? "New Player" : "Returning Player"}
                    </div>

                    {/* Heading context shifts safely */}
                    <h1 className=" font-headline-lg text-headline-lg text-center mb-xl uppercase tracking-tight text-deep-ink">
                        {mode === "signup" ? (
                            <>
                                Join the{" "}
                                <span className="text-action-red">Arena</span>
                            </>
                        ) : (
                            <>
                                Enter the{" "}
                                <span className="text-action-red">Arena</span>
                            </>
                        )}
                    </h1>

                    <form
                        className="space-y-md text-sm font-bold text-black"
                        onSubmit={handleSubmitAction}
                    >
                        {/* Username Input Field */}
                        <div className="space-y-xs">
                            <label
                                htmlFor="username-input"
                                className="font-label-bold text-deep-ink uppercase block"
                            >
                                Username
                            </label>
                            <input
                                id="username-input"
                                type="text"
                                autoComplete="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                onKeyDown={handleKeyDownAnimation}
                                required
                                disabled={state.status === "is-loading"}
                                placeholder="WORD_WIZARD"
                                className="w-full bg-paper-white border-[3px] border-deep-ink p-md font-label-mono focus:ring-0 focus:border-action-red transition-colors outline-none"
                            />
                        </div>

                        {/* Email Field Panel -> Mounts only on account creations */}
                        {mode === "signup" && (
                            <div className="space-y-xs transition-all duration-300">
                                <label
                                    htmlFor="email-input"
                                    className="font-label-bold text-deep-ink uppercase block"
                                >
                                    Email Address
                                </label>
                                <input
                                    id="email-input"
                                    type="email"
                                    autoComplete="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    onKeyDown={handleKeyDownAnimation}
                                    placeholder="PLAY@TARES.GAME"
                                    required
                                    disabled={state.status === "is-loading"}
                                    className="w-full bg-paper-white border-[3px] border-deep-ink p-md font-label-mono focus:ring-0 focus:border-action-red transition-colors outline-none"
                                />
                            </div>
                        )}

                        {/* Grid Container adjusts layout constraints dynamically */}
                        <div
                            className={`grid grid-cols-1 gap-md transition-all duration-300 ${mode === "signup" ? "md:grid-cols-2" : ""}`}
                        >
                            <div className="space-y-xs">
                                <label
                                    htmlFor="password-input"
                                    className="font-label-bold text-deep-ink uppercase block"
                                >
                                    Password
                                </label>
                                <input
                                    id="password-input"
                                    type="password"
                                    autoComplete={
                                        mode === "signup"
                                            ? "new-password"
                                            : "current-password"
                                    }
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                    onKeyDown={handleKeyDownAnimation}
                                    placeholder="••••••••"
                                    required
                                    disabled={state.status === "is-loading"}
                                    className="w-full bg-paper-white border-[3px] border-deep-ink p-md font-label-mono focus:ring-0 focus:border-action-red transition-colors outline-none"
                                />
                                {mode === "login" && (
                                    <div className="pt-1">
                                        <a
                                            className="text-xs font-label-mono text-deep-ink underline hover:text-action-red transition-colors"
                                            href="#"
                                        >
                                            Forgot Password?
                                        </a>
                                    </div>
                                )}
                            </div>

                            {/* Confirm Password Field (Sign Up Only) */}
                            {mode === "signup" && (
                                <div className="space-y-xs">
                                    <label
                                        htmlFor="confirm-input"
                                        className="font-label-bold text-deep-ink uppercase block"
                                    >
                                        Confirm
                                    </label>
                                    <input
                                        id="confirm-input"
                                        type="password"
                                        autoComplete="new-password"
                                        value={confirmPassword}
                                        onChange={(e) =>
                                            setConfirmPassword(e.target.value)
                                        }
                                        onKeyDown={handleKeyDownAnimation}
                                        placeholder="••••••••"
                                        required
                                        disabled={state.status === "is-loading"}
                                        className="w-full bg-paper-white border-[3px] border-deep-ink p-md font-label-mono focus:ring-0 focus:border-action-red transition-colors outline-none"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Main CTA Submission Button Control */}
                        <button
                            type="submit"
                            className="w-full bg-action-red text-paper-white border-[3px] border-deep-ink py-lg font-headline-md uppercase neubrutalist-shadow btn-active transition-all mt-xl cursor-pointer"
                        >
                            {state.status === "is-loading"
                                ? "Verifying..."
                                : mode === "signup"
                                  ? "Sign Up"
                                  : "Log In"}
                        </button>
                    </form>

                    {/* Core Interactive Switch Trigger */}
                    <div className="mt-lg text-center">
                        <button
                            type="button"
                            onClick={() =>
                                setMode((prev) =>
                                    prev === "signup" ? "login" : "signup",
                                )
                            }
                            className="font-label-bold text-deep-ink hover:text-action-red transition-colors underline decoration-[2px] underline-offset-4 bg-transparent border-none cursor-pointer"
                        >
                            {mode === "signup"
                                ? "Already have an account? Log in"
                                : "New player? Create an account"}
                        </button>
                    </div>
                </section>
            </main>
            <Footer/>
        </div>
    );
}
