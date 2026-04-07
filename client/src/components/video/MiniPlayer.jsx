import { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useUIStore } from "@/store/uiStore";
import { FiX, FiMaximize2, FiPlay, FiPause } from "react-icons/fi";

export default function MiniPlayer() {
  const { miniPlayer, closeMiniPlayer } = useUIStore();
  const videoRef = useRef(null);
  const [playing, setPlaying] = useState(true);

  useEffect(() => {
    if (miniPlayer && videoRef.current) {
      videoRef.current.play().catch(() => {});
      setPlaying(true);
    }
  }, [miniPlayer]);

  if (!miniPlayer) return null;

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (playing) videoRef.current.pause();
    else videoRef.current.play();
    setPlaying(!playing);
  };

  return (
    <div className="mini-player bg-zinc-900 border border-zinc-700">
      <div className="relative aspect-video">
        <video
          ref={videoRef}
          src={miniPlayer.url}
          poster={miniPlayer.thumbnail}
          className="w-full h-full object-cover"
          onEnded={() => setPlaying(false)}
        />
        {/* Controls overlay */}
        <div className="absolute inset-0 bg-black/0 hover:bg-black/40 transition-colors flex items-center justify-center gap-4 opacity-0 hover:opacity-100">
          <button onClick={togglePlay} className="text-white p-2 bg-black/60 rounded-full hover:bg-red-600 transition-colors">
            {playing ? <FiPause size={18} /> : <FiPlay size={18} />}
          </button>
        </div>
        {/* Top actions */}
        <div className="absolute top-2 right-2 flex gap-1">
          <Link
            to={`/watch/${miniPlayer.id}`}
            onClick={closeMiniPlayer}
            className="p-1.5 bg-black/70 text-white rounded-full hover:bg-black transition-colors"
            title="Open video"
          >
            <FiMaximize2 size={14} />
          </Link>
          <button
            onClick={closeMiniPlayer}
            className="p-1.5 bg-black/70 text-white rounded-full hover:bg-red-600 transition-colors"
          >
            <FiX size={14} />
          </button>
        </div>
      </div>
      <div className="px-3 py-2">
        <Link to={`/watch/${miniPlayer.id}`} onClick={closeMiniPlayer} className="text-sm font-medium text-white line-clamp-1 hover:text-red-400 transition-colors">
          {miniPlayer.title}
        </Link>
      </div>
    </div>
  );
}
