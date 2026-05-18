import { Activity, ClipboardList, LayoutDashboard, Map, Shield } from "lucide-react";
import { NavLink } from "react-router-dom";
import { leagueLogo } from "../../data/teamLogos.js";

const links = [
  { to: "/overview", label: "Overview", icon: LayoutDashboard },
  { to: "/matches", label: "Matches", icon: ClipboardList },
  { to: "/players", label: "Players", icon: Activity },
  { to: "/teams", label: "Teams", icon: Shield },
  { to: "/formations", label: "Formations", icon: Map },
];

export default function Navbar() {
  return (
    <>
      <header className="fixed inset-x-0 top-0 z-40 border-b border-border bg-bg">
        <div className="mx-auto flex h-12 max-w-[1584px] items-center justify-between px-3 sm:px-6 lg:px-8">
          <NavLink to="/overview" className="flex items-center gap-3" aria-label="Liga 1 Analytics overview">
            <span className="grid h-8 w-8 place-items-center border border-border bg-white">
              <img src={leagueLogo.image} alt="Liga 1 logo" className="h-7 w-7 object-contain p-0.5" />
            </span>
            <span>
              <span className="block text-sm font-semibold text-text">PunditStat</span>
            </span>
          </NavLink>
          <nav className="hidden items-center gap-1 md:flex" aria-label="Primary navigation">
            {links.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex h-12 items-center gap-2 border-b-2 px-4 text-sm transition ${
                    isActive ? "border-teal bg-panel text-text" : "border-transparent text-muted hover:bg-panel hover:text-text"
                  }`
                }
              >
                <Icon className="h-4 w-4" />
                {label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-border bg-bg md:hidden" aria-label="Mobile navigation">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 px-2 py-3 text-[11px] ${isActive ? "text-teal" : "text-muted"}`
            }
          >
            <Icon className="h-4 w-4" />
            {label}
          </NavLink>
        ))}
      </nav>
    </>
  );
}
