import React, { useState} from "react";
import type { LoginRequest, SignupRequest } from "#types/type";
import { useAuth } from "#state/auth-reducer";
import { Eye } from 'lucide-react'
import { Footer } from "#components/footer";
import { Outlet } from "react-router-dom";
import {useAnimation } from '#components/index'; 


export function AuthGate() {
  const { state, login, signup } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const { handleKeyDownAnimation, backgroundLetters } = useAnimation();
  
  // 2. Form submission / loading simulator
  const handleSubmitAction = async (e: React.ChangeEvent) => {
        e.preventDefault();
        if (mode === "login") {
            const data: LoginRequest = { email: email, password:{plain_text: password} };
            await login(data);
        } else if (mode === "signup") {
          const data: SignupRequest = { email, username, password:{plain_text: password} };
            await signup(data);
        }
    };

    // trial
    if (state.status === "is-authenticated") {
        return <><Outlet/></>
    } else {
    return (
        <div className="bg-background h-full  text-on-background min-h-screen flex flex-col font-body-md overflow-x-hidden">
            <main className="grow flex items-center justify-center relative py-xl px-margin-mobile">
                {/* Structural Floating Badges */}
                <div className="absolute top-20 left-10 sticker-float hidden lg:block">
                    <div className="bg-sky-blue border-2 border-deep-ink p-4 rotate-12 neubrutalist-shadow flex items-center justify-center">
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
                    <div className="bg-action-red border-2 border-deep-ink p-4 rotate-12deg neubrutalist-shadow flex items-center justify-center">
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
                <section className="w-full max-w-2xl bg-sky-blue border-4px border-deep-ink p-lg md:p-xl relative neubrutalist-shadow-large mode-transition z-10">
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

                    <form className="space-y-md text-sm font-bold text-black" onSubmit={handleSubmitAction} >
                        {/* Username Input Field */}
                        {mode==="signup" && (<div className="space-y-xs">
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
                        </div>)}

                        {/* Email Field Panel -> Mounts only on account creations */}

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
                        {/* Grid Container adjusts layout constraints dynamically */}
                        <div className={`grid grid-cols-1 gap-md transition-all duration-300 ${mode === "signup" ? "md:grid-cols-2" : ""}`}
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
                                    type={showPassword? "text":"password"}
                                    autoComplete={ mode === "signup"? "new-password" : "current-password"}
                                    value={password}
                                    onChange={(e) =>setPassword(e.target.value)}
                                    onKeyDown={handleKeyDownAnimation}
                                    placeholder="password"
                                    required
                                    disabled={state.status === "is-loading"}
                                    className="w-full bg-paper-white text-deep-ink border-[3px] border-deep-ink p-md font-label-mono focus:ring-0 focus:border-action-red transition-colors outline-none"
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
                                        type={showPassword? "text":"password"}
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
                <button type="button" className="flex flex-row gap-2" onClick={() => setShowPassword(prev => !prev)}>
                  <Eye className="texttext-deep-ink" /> { showPassword? "Hide Password": "View Password" }
                </button>
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

}
