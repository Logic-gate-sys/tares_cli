import { NavLink,Link } from "react-router-dom";

type Resource = {
    link: string,
    name: string 
}
const resources: Resource[] = [
    { name: "Home", link: "/" },
    { name: "Global-Stats", link: "/global-stats" },
    { name: "Archives", link:"/achives"}
]
export function NavigationBar() {
    return (
        <>
            <nav className="flex justify-between items-center px-4 md:px-10 py-4 w-full sticky top-0 z-50 bg-white border-b-4 border-deep-ink shadow-[4px_4px_0px_0px_#121721]">
                <div className="flex items-center gap-4">
                    <div className="text-4xl font-extrabold italic uppercase text-deep-ink tracking-tight">
                        TARES
                    </div>
                    <div className="hidden md:flex gap-8 ml-8 font-bold text-xl">
                      {resources.map((res, idx) => (
                        <NavLink 
                          key={idx} 
                          to={res.link}
                          className={({ isActive }) => 
                            `transition-colors decoration-4 underline-offset-8 hover:text-action-red ${
                              isActive 
                                ? "text-action-red underline" 
                                : "text-deep-ink"
                            }`
                          }
                        >
                          {res.name}
                        </NavLink>
                      ))}
                    </div>
                </div>
                <div className="flex gap-4">
                    <Link to="/game/lobby">
                        <button className="font-mono font-bold text-sm px-6 py-2 border-4 border-deep-ink bg-action-red text-white neubrutal-shadow hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_#121721] transition-all active:translate-x-0.5 active:translate-y-0.5 active:shadow-none">
                            PLAY NOW
                        </button>
                    </Link>
                </div>
            </nav>
        </>
    );
}
