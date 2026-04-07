import { NavLink, useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { useUIStore } from "@/store/uiStore";
import {
  FiHome, FiTrendingUp, FiPlayCircle, FiClock, FiList,
  FiMusic, FiMonitor, FiBook, FiActivity, FiRadio, FiStar, FiCpu, FiMoreHorizontal, FiFilm
} from "react-icons/fi";

const CATEGORY_ICONS = {
  Music: <FiMusic size={16} />, Gaming: <FiMonitor size={16} />, Education: <FiBook size={16} />,
  Sports: <FiActivity size={16} />, News: <FiRadio size={16} />, Entertainment: <FiStar size={16} />,
  Technology: <FiCpu size={16} />, Other: <FiMoreHorizontal size={16} />,
};

const navLinks = [
  { to: "/", label: "Home", icon: <FiHome size={18} />, exact: true },
  { to: "/shorts", label: "Shorts", icon: <FiFilm size={18} />, exact: true },
  { to: "/trending", label: "Trending", icon: <FiTrendingUp size={18} /> },
  { to: "/subscriptions", label: "Subscriptions", icon: <FiPlayCircle size={18} />, auth: true },
  { to: "/history", label: "History", icon: <FiClock size={18} />, auth: true },
  { to: "/playlists", label: "Playlists", icon: <FiList size={18} />, auth: true },
];

export default function Sidebar({ open, onClose }) {
  const { user } = useAuthStore();
  const { sidebarCollapsed } = useUIStore();
  const location = useLocation();

  const linkClass = (isActive) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150 ${
      isActive
        ? "bg-zinc-100 dark:bg-zinc-800 font-semibold text-zinc-900 dark:text-white"
        : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white"
    } ${sidebarCollapsed ? "justify-center" : ""}`;

  const content = (
    <div className="flex flex-col h-full overflow-y-auto py-3 scrollbar-hide">
      <div className="px-2 space-y-0.5">
        {navLinks.map(({ to, label, icon, auth, exact }) => {
          if (auth && !user) return null;
          const isActive = exact ? location.pathname === to : location.pathname.startsWith(to);
          return (
            <NavLink key={to} to={to} className={() => linkClass(isActive)} onClick={onClose} title={sidebarCollapsed ? label : ""}>
              <span className="shrink-0">{icon}</span>
              {!sidebarCollapsed && <span>{label}</span>}
            </NavLink>
          );
        })}
      </div>

      {!sidebarCollapsed && (
        <>
          <div className="mx-3 my-3 border-t border-zinc-200 dark:border-zinc-800" />
          <div className="px-2">
            <p className="text-xs font-semibold text-zinc-400 uppercase px-3 mb-2 tracking-wider">Explore</p>
            {Object.entries(CATEGORY_ICONS).map(([cat, icon]) => {
              const isActive = location.search === `?category=${cat}`;
              return (
                <NavLink
                  key={cat}
                  to={`/?category=${cat}`}
                  className={() => linkClass(isActive)}
                  onClick={onClose}
                >
                  <span className="shrink-0 text-zinc-500">{icon}</span>
                  <span>{cat}</span>
                </NavLink>
              );
            })}
          </div>
        </>
      )}
    </div>
  );

  const width = sidebarCollapsed ? "w-16" : "w-56";

  return (
    <>
      {/* Desktop sidebar */}
      <aside className={`hidden md:flex flex-col ${width} shrink-0 sticky top-14 h-[calc(100vh-3.5rem)] border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0f0f0f] transition-all duration-200 overflow-hidden`}>
        {content}
      </aside>

      {/* Mobile drawer */}
      {open && (
        <>
          <div className="fixed inset-0 z-40 bg-black/60 md:hidden backdrop-blur-sm" onClick={onClose} />
          <aside className="fixed top-0 left-0 z-50 w-64 h-full bg-white dark:bg-zinc-900 shadow-2xl md:hidden pt-14 transition-transform">
            {content}
          </aside>
        </>
      )}
    </>
  );
}
