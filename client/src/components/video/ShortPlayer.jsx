import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { FiThumbsUp, FiThumbsDown, FiMessageSquare, FiShare2, FiMoreVertical, FiPlay, FiPause, FiVolume2, FiVolumeX } from "react-icons/fi";
import api from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import toast from "react-hot-toast";

export default function ShortPlayer({ short }) {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [likes, setLikes] = useState(short.likes?.length || 0);
  const [isLiked, setIsLiked] = useState(false); // Can be initialized from API if needed
  
  const { user } = useAuthStore();
  const backendUrl = import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5000";
  const videoSrc = short.url.startsWith("http") ? short.url : `${backendUrl}${short.url}`;

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            videoRef.current?.play().catch(e => console.log("Autoplay prevented:", e));
            setIsPlaying(true);
          } else {
            videoRef.current?.pause();
            setIsPlaying(false);
          }
        });
      },
      { threshold: 0.6 } // Play when 60% visible
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) observer.unobserve(containerRef.current);
    };
  }, []);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = (e) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleLike = async (e) => {
    e.stopPropagation();
    if (!user) return toast.error("Please login to like");
    try {
      const { data } = await api.post(`/videos/${short._id}/like`);
      setLikes(data.likes);
      setIsLiked(data.liked);
    } catch (err) {
      toast.error("Failed to like video");
    }
  };

  return (
    <div 
      ref={containerRef} 
      className="relative w-full max-w-sm aspect-[9/16] bg-black rounded-2xl overflow-hidden shadow-xl"
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        src={videoSrc}
        className="w-full h-full object-cover cursor-pointer"
        loop
        playsInline
        muted={isMuted}
        onClick={togglePlay}
      />

      {/* Play/Pause Overlay Icon (shows briefly on click or when paused) */}
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-black/20">
          <div className="w-16 h-16 bg-black/50 rounded-full flex items-center justify-center text-white backdrop-blur-sm">
            <FiPlay size={32} className="ml-1" />
          </div>
        </div>
      )}

      {/* Top Controls */}
      <div className="absolute top-4 right-4 flex gap-3">
        <button onClick={toggleMute} className="p-2 bg-black/40 hover:bg-black/60 rounded-full text-white backdrop-blur-sm transition">
          {isMuted ? <FiVolumeX size={20} /> : <FiVolume2 size={20} />}
        </button>
      </div>

      {/* Bottom Info Overlay */}
      <div className="absolute bottom-0 left-0 right-16 p-4 pt-12 bg-gradient-to-t from-black/80 via-black/40 to-transparent text-white">
        <div className="flex items-center gap-3 mb-3">
          <Link to={`/channel/${short.uploader._id}`} className="shrink-0" onClick={(e) => e.stopPropagation()}>
            {short.uploader.avatar ? (
              <img src={short.uploader.avatar} alt="avatar" className="w-9 h-9 rounded-full object-cover border border-white/20" />
            ) : (
              <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-sm font-bold border border-white/20">
                {short.uploader.name.charAt(0).toUpperCase()}
              </div>
            )}
          </Link>
          <div className="flex-1 min-w-0">
            <Link to={`/channel/${short.uploader._id}`} onClick={(e) => e.stopPropagation()}>
              <p className="font-semibold text-sm truncate hover:underline shadow-sm">{short.uploader.channelName || short.uploader.name}</p>
            </Link>
          </div>
          <button className="px-3 py-1 bg-white hover:bg-zinc-200 text-black text-xs font-bold rounded-full transition" onClick={(e) => e.stopPropagation()}>
            Subscribe
          </button>
        </div>
        <p className="text-sm line-clamp-2 shadow-sm font-medium">{short.title}</p>
      </div>

      {/* Right Side Actions Overlay */}
      <div className="absolute bottom-4 right-2 flex flex-col items-center gap-4 text-white z-10">
        <button onClick={handleLike} className="flex flex-col items-center gap-1 group">
          <div className="w-12 h-12 bg-black/40 group-hover:bg-black/60 rounded-full flex items-center justify-center backdrop-blur-sm transition">
            <FiThumbsUp size={24} className={isLiked ? "fill-white" : ""} />
          </div>
          <span className="text-xs font-semibold drop-shadow-md">{likes}</span>
        </button>
        
        <button className="flex flex-col items-center gap-1 group">
          <div className="w-12 h-12 bg-black/40 group-hover:bg-black/60 rounded-full flex items-center justify-center backdrop-blur-sm transition">
            <FiThumbsDown size={24} />
          </div>
          <span className="text-xs font-semibold drop-shadow-md">Dislike</span>
        </button>
        
        <button className="flex flex-col items-center gap-1 group" onClick={(e) => {
          e.stopPropagation();
          navigator.clipboard.writeText(window.location.host + "/watch/" + short._id);
          toast.success("Link copied!");
        }}>
          <div className="w-12 h-12 bg-black/40 group-hover:bg-black/60 rounded-full flex items-center justify-center backdrop-blur-sm transition">
            <FiShare2 size={24} />
          </div>
          <span className="text-xs font-semibold drop-shadow-md">Share</span>
        </button>

        <button className="flex flex-col items-center gap-1 group">
          <div className="w-12 h-12 bg-black/40 group-hover:bg-black/60 rounded-full flex items-center justify-center backdrop-blur-sm transition">
            <FiMoreVertical size={24} />
          </div>
        </button>
      </div>
    </div>
  );
}
