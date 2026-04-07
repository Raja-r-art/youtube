import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { useUIStore } from "@/store/uiStore";
import { avatarFallback } from "@/lib/utils";
import {
  FiSearch, FiUpload, FiMenu, FiBell, FiSun, FiMoon,
  FiUser, FiSettings, FiLogOut, FiClock, FiList, FiVideo
} from "react-icons/fi";

export default function Navbar({ onMenuToggle }) {
  const { user, logout } = useAuthStore();
  const { darkMode, toggleDark } = useUIStore();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [suggestions] = useState([]);
  const searchRef = useRef(null);

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      setSearchFocused(false);
    }
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (!e.target.closest("[data-dropdown]")) setDropdownOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-14 flex items-center px-3 gap-2 bg-white dark:bg-[#0f0f0f] border-b border-zinc-200 dark:border-zinc-800">
      {/* Left */}
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={onMenuToggle}
          className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        >
          <FiMenu size={20} />
        </button>
        <Link to="/" className="flex items-center gap-1.5 font-bold text-xl select-none ml-1">
          <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center text-white text-sm font-black">▶</div>
          <span className="hidden sm:block text-zinc-900 dark:text-white">YTClone</span>
        </Link>
      </div>

      {/* Search */}
      <div className="flex flex-1 max-w-2xl mx-auto relative" ref={searchRef}>
        <form onSubmit={handleSearch} className="flex w-full">
          <div className="relative flex-1">
            {searchFocused && (
              <FiSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            )}
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setTimeout(() => setSearchFocused(false), 150)}
              placeholder="Search"
              className={`w-full py-2 rounded-l-full border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm outline-none focus:border-blue-500 dark:focus:border-blue-400 transition-colors ${searchFocused ? "pl-8" : "pl-4"}`}
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2 rounded-r-full border border-l-0 border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
          >
            <FiSearch size={16} />
          </button>
        </form>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-1 shrink-0">
        {/* Dark mode toggle */}
        <button
          onClick={toggleDark}
          className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          title={darkMode ? "Light mode" : "Dark mode"}
        >
          {darkMode ? <FiSun size={18} /> : <FiMoon size={18} />}
        </button>

        {user ? (
          <>
            {/* Upload */}
            <Link
              to="/upload"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-sm transition-colors"
              title="Upload video"
            >
              <FiVideo size={18} />
            </Link>

            {/* Notifications */}
            <button className="relative p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors" title="Notifications">
              <FiBell size={18} />
              <span className="notif-dot" />
            </button>

            {/* Avatar dropdown */}
            <div className="relative" data-dropdown>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-red-500 to-orange-400 text-white flex items-center justify-center font-semibold text-sm ml-1 ring-2 ring-transparent hover:ring-blue-500 transition-all"
              >
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                ) : avatarFallback(user.name)}
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 top-11 w-60 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-2xl shadow-2xl py-2 z-50 overflow-hidden">
                  {/* User info */}
                  <div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-100 dark:border-zinc-800">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-red-500 to-orange-400 text-white flex items-center justify-center font-semibold shrink-0">
                      {user.avatar ? <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" /> : avatarFallback(user.name)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate">{user.name}</p>
                      <p className="text-xs text-zinc-500 truncate">{user.email}</p>
                    </div>
                  </div>

                  {[
                    { to: `/channel/${user._id}`, icon: <FiUser size={15} />, label: "Your channel" },
                    { to: "/upload", icon: <FiUpload size={15} />, label: "Upload video" },
                    { to: "/history", icon: <FiClock size={15} />, label: "Watch history" },
                    { to: "/playlists", icon: <FiList size={15} />, label: "Playlists" },
                    { to: "/profile", icon: <FiSettings size={15} />, label: "Settings" },
                  ].map(({ to, icon, label }) => (
                    <Link
                      key={to}
                      to={to}
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                    >
                      <span className="text-zinc-500">{icon}</span> {label}
                    </Link>
                  ))}

                  <div className="border-t border-zinc-100 dark:border-zinc-800 mt-1 pt-1">
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        logout();
                        navigate("/");
                      }}
                      className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                    >
                      <FiLogOut size={15} /> Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <Link
            to="/login"
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-blue-500 text-blue-500 text-sm font-medium hover:bg-blue-50 dark:hover:bg-blue-950 transition-colors"
          >
            <FiUser size={14} /> Sign in
          </Link>
        )}
      </div>
    </nav>
  );
}
