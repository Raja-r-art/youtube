import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { formatViews, formatDuration, timeAgo, avatarFallback } from "@/lib/utils";
import { FiMoreVertical, FiClock, FiList, FiShare2, FiFlag } from "react-icons/fi";
import { useAuthStore } from "@/store/authStore";
import toast from "react-hot-toast";

export default function VideoCard({ video, horizontal = false }) {
  const uploader = video.uploader || {};
  const [menuOpen, setMenuOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const hoverTimer = useRef(null);
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const handleMouseEnter = () => {
    hoverTimer.current = setTimeout(() => setHovered(true), 800);
  };
  const handleMouseLeave = () => {
    clearTimeout(hoverTimer.current);
    setHovered(false);
  };

  const handleShare = (e) => {
    e.preventDefault();
    navigator.clipboard.writeText(`${window.location.origin}/watch/${video._id}`);
    toast.success("Link copied!");
    setMenuOpen(false);
  };

  if (horizontal) {
    return (
      <Link to={`/watch/${video._id}`} className="flex gap-2 group">
        <div className="relative shrink-0 w-40 aspect-video rounded-xl overflow-hidden bg-zinc-200 dark:bg-zinc-800">
          <img
            src={video.thumbnail || "https://placehold.co/320x180/1a1a1a/666?text=No+Thumbnail"}
            alt={video.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {video.duration > 0 && (
            <span className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded-md font-medium">
              {formatDuration(video.duration)}
            </span>
          )}
        </div>
        <div className="flex-1 min-w-0 py-0.5">
          <p className="text-sm font-medium line-clamp-2 group-hover:text-blue-500 transition-colors leading-snug">{video.title}</p>
          <p className="text-xs text-zinc-500 mt-1.5">{uploader.channelName || uploader.name}</p>
          <p className="text-xs text-zinc-500">{formatViews(video.views)} views · {timeAgo(video.createdAt)}</p>
        </div>
      </Link>
    );
  }

  return (
    <div
      className="group relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Thumbnail */}
      <Link to={`/watch/${video._id}`} className="block">
        <div className="relative aspect-video rounded-xl overflow-hidden bg-zinc-200 dark:bg-zinc-800">
          <img
            src={video.thumbnail || "https://placehold.co/640x360/1a1a1a/666?text=No+Thumbnail"}
            alt={video.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {/* Hover video preview overlay */}
          {hovered && video.url && (
            <video
              src={video.url}
              autoPlay
              muted
              loop
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}
          {video.duration > 0 && (
            <span className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded-md font-medium">
              {formatDuration(video.duration)}
            </span>
          )}
          {/* Watch later on hover */}
          <button
            onClick={(e) => { e.preventDefault(); toast.success("Saved to Watch Later"); }}
            className="absolute top-2 right-2 p-1.5 bg-black/70 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black"
            title="Save to Watch Later"
          >
            <FiClock size={14} />
          </button>
        </div>
      </Link>

      {/* Info row */}
      <div className="flex gap-3 mt-3">
        <Link to={`/channel/${uploader._id}`} className="shrink-0 mt-0.5">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-red-500 to-orange-400 text-white flex items-center justify-center text-sm font-semibold overflow-hidden hover:ring-2 hover:ring-blue-500 transition-all">
            {uploader.avatar ? (
              <img src={uploader.avatar} alt={uploader.name} className="w-full h-full object-cover" />
            ) : avatarFallback(uploader.name)}
          </div>
        </Link>
        <div className="min-w-0 flex-1">
          <Link to={`/watch/${video._id}`}>
            <p className="text-sm font-semibold line-clamp-2 hover:text-blue-500 transition-colors leading-snug">{video.title}</p>
          </Link>
          <Link to={`/channel/${uploader._id}`}>
            <p className="text-xs text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 mt-1">
              {uploader.channelName || uploader.name}
            </p>
          </Link>
          <p className="text-xs text-zinc-500">{formatViews(video.views)} views · {timeAgo(video.createdAt)}</p>
        </div>

        {/* Options menu */}
        <div className="relative shrink-0">
          <button
            onClick={(e) => { e.preventDefault(); setMenuOpen(!menuOpen); }}
            className="p-1 rounded-full opacity-0 group-hover:opacity-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all mt-0.5"
          >
            <FiMoreVertical size={16} />
          </button>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-7 w-48 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-xl py-1 z-40">
                {[
                  { icon: <FiClock size={14} />, label: "Save to Watch Later", action: () => { toast.success("Saved"); setMenuOpen(false); } },
                  { icon: <FiList size={14} />, label: "Save to Playlist", action: () => { if (!user) { toast.error("Sign in first"); } else { navigate(`/watch/${video._id}`); } setMenuOpen(false); } },
                  { icon: <FiShare2 size={14} />, label: "Share", action: handleShare },
                  { icon: <FiFlag size={14} />, label: "Report", action: () => { toast("Report submitted"); setMenuOpen(false); } },
                ].map(({ icon, label, action }) => (
                  <button key={label} onClick={action} className="flex items-center gap-3 w-full px-4 py-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                    <span className="text-zinc-500">{icon}</span> {label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
