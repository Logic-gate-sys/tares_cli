import { NavLink } from "react-router-dom"
export const Footer = () => {
    return (
        <>
          {/* FOOTER BRANDING LAYER */}
          <footer className="flex flex-col md:flex-row justify-between items-center gap-4 px-4 md:px-10 py-8 w-full bg-[#BFE6F7] border-t-4 border-[#121721] mt-auto">
            <div className="text-2xl font-bold text-[#121721] uppercase italic">Tares</div>
            <div className="flex flex-wrap justify-center gap-4 font-mono text-sm text-[#121721] font-bold">
              <NavLink className="hover:text-[#EC2513] hover:underline decoration-[2px]" to="/">Home</NavLink>
              <NavLink className="hover:text-[#EC2513] hover:underline decoration-[2px]" to="/global-stats">Global Rankings</NavLink>
              <NavLink className="hover:text-[#EC2513] hover:underline decoration-[2px]" to="/privacy">Privacy</NavLink>
            </div>
            <div className="font-mono text-xs text-[#121721] opacity-80 font-bold">
              © 2026 TARES WORD GAME. NO MERCY.
            </div>
          </footer>
        </>
    )
}