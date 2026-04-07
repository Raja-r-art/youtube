import { useRef, useState, useEffect, useCallback } from "react";
import {
  FiPlay, FiPause, FiVolume2, FiVolumeX, FiMaximize, FiMinimize,
  FiSettings, FiSkipBack, FiSkipForward, FiMinimize2
} from "react-icons/fi";
import { formatDuration } from "@/lib/utils";
import { useUIStore } from "@/store/uiStore";

const SPEEDS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

export default function VideoPlayer({ url, thumbnail, title, videoId }) {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const progressRef = useRef(null);
  const hideTimer = useRef(null);
  const { setMiniPlayer } = useUIStore();

  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [progress, setProgress] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [showSettings, setShowSettings] = useState(false);
  const [theatreMode, setTheatreMode] = useState(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [seekPreview, setSeekPreview] = useState(null);

  const resetHideTimer = useCallback(() => {
    setShowControls(true);
    clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => {
      if (videoRef.current && !videoRef.current.paused) setShowControls(false);
    }, 3000);
  }, []);

  useEffect(() => () => clearTimeout(hideTimer.current), []);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
      const v = videoRef.current;
      if (!v) return;
      switch (e.key) {
        case " ": case "k": e.preventDefault(); togglePlay(); break;
        case "ArrowRight": case "l": v.currentTime = Math.min(v.duration, v.currentTime + 10); break;
        case "ArrowLeft": case "j": v.currentTime = Math.max(0, v.currentTime - 10); break;
        case "ArrowUp": e.preventDefault(); v.volume = Math.min(1, v.volume + 0.1); setVolume(v.volume); break;
        case "ArrowDown": e.preventDefault(); v.volume = Math.max(0, v.volume - 0.1); setVolume(v.volume); break;
        case "m": toggleMute(); break;
        case "f": toggleFullscreen(); break;
        case "t": setTheatreMode((p) => !p); break;
        case "0": case "1": case "2": case "3": case "4":
        case "5": case "6": case "7": case "8": case "9":
          v.currentTime = (parseInt(e.key) / 10) * v.duration; break;
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [playing]);

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) { v.play(); setPlaying(true); }
    else { v.pause(); setPlaying(false); }
    resetHideTimer();
  };

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setFullscreen(true);
    } else {
      document.exitFullscreen();
      setFullscreen(false);
    }
  };

  const handleTimeUpdate = () => {
    const v = videoRef.current;
    if (!v || !v.duration) return;
    setCurrentTime(v.currentTime);
    setProgress((v.currentTime / v.duration) * 100);
    if (v.buffered.length > 0) {
      setBuffered((v.buffered.end(v.buffered.length - 1) / v.duration) * 100);
    }
  };

  const handleProgressClick = (e) => {
    const v = videoRef.current;
    const bar = progressRef.current;
    if (!v || !bar) return;
    const rect = bar.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    v.currentTime = ratio * v.duration;
  };

  const handleProgressHover = (e) => {
    const bar = progressRef.current;
    if (!bar || !duration) return;
    const rect = bar.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setSeekPreview({ time: ratio * duration, x: e.clientX - rect.left });
  };

  const handleVolumeChange = (e) => {
    const val = Number(e.target.value);
    if (videoRef.current) videoRef.current.volume = val;
    setVolume(val);
    setMuted(val === 0);
  };

  const handleSpeed = (s) => {
    if (videoRef.current) videoRef.current.playbackRate = s;
    setSpeed(s);
    setShowSettings(false);
  };

  const handleMiniPlayer = () => {
    if (videoRef.current) videoRef.current.pause();
    setPlaying(false);
    setMiniPlayer({ url, thumbnail, title, id: videoId });
  };

  const skip = (secs) => {
    const v = videoRef.current;
    if (v) v.currentTime = Math.max(0, Math.min(v.duration, v.currentTime + secs));
  };

  return (
    <div
      ref={containerRef}
      className={`relative bg-black overflow-hidden select-none group ${
        theatreMode ? "w-full" : "rounded-xl"
      } ${fullscreen ? "rounded-none" : ""}`}
      style={{ aspectRatio: "16/9" }}
      onMouseMove={resetHideTimer}
      onMouseLeave={() => { if (playing) setShowControls(false); setSeekPreview(null); }}
      onDoubleClick={toggleFullscreen}
    >
      <video
        ref={videoRef}
        src={url}
        poster={thumbnail}
        className="w-full h-full cursor-pointer"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={() => setDuration(videoRef.current?.duration || 0)}
        onEnded={() => { setPlaying(false); setShowControls(true); }}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onClick={togglePlay}
      />

      {/* Center play/pause flash */}
      {!playing && (
        <button onClick={togglePlay} className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-red-600 transition-colors backdrop-blur-sm">
            <FiPlay size={28} className="ml-1" />
          </div>
        </button>
      )}

      {/* Controls */}
      <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent px-4 pb-3 pt-12 transition-opacity duration-300 ${showControls ? "opacity-100" : "opacity-0 pointer-events-none"}`}>

        {/* Progress bar */}
        <div
          ref={progressRef}
          className="relative h-1 mb-3 cursor-pointer group/progress"
          onClick={handleProgressClick}
          onMouseMove={handleProgressHover}
          onMouseLeave={() => setSeekPreview(null)}
        >
          <div className="absolute inset-0 bg-white/20 rounded-full" />
          <div className="absolute left-0 top-0 h-full bg-white/40 rounded-full" style={{ width: `${buffered}%` }} />
          <div className="absolute left-0 top-0 h-full bg-red-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
          <div
            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-red-500 rounded-full -ml-1.5 opacity-0 group-hover/progress:opacity-100 transition-opacity"
            style={{ left: `${progress}%` }}
          />
          {/* Seek preview tooltip */}
          {seekPreview && (
            <div
              className="absolute -top-8 bg-black/90 text-white text-xs px-2 py-1 rounded -translate-x-1/2 pointer-events-none"
              style={{ left: seekPreview.x }}
            >
              {formatDuration(Math.floor(seekPreview.time))}
            </div>
          )}
        </div>

        {/* Controls row */}
        <div className="flex items-center gap-2 text-white">
          <button onClick={() => skip(-10)} className="p-1 hover:text-red-400 transition-colors" title="Back 10s (J)">
            <FiSkipBack size={16} />
          </button>
          <button onClick={togglePlay} className="p-1 hover:text-red-400 transition-colors" title="Play/Pause (K)">
            {playing ? <FiPause size={20} /> : <FiPlay size={20} />}
          </button>
          <button onClick={() => skip(10)} className="p-1 hover:text-red-400 transition-colors" title="Forward 10s (L)">
            <FiSkipForward size={16} />
          </button>

          {/* Volume */}
          <div
            className="flex items-center gap-1"
            onMouseEnter={() => setShowVolumeSlider(true)}
            onMouseLeave={() => setShowVolumeSlider(false)}
          >
            <button onClick={toggleMute} className="p-1 hover:text-red-400 transition-colors" title="Mute (M)">
              {muted || volume === 0 ? <FiVolumeX size={18} /> : <FiVolume2 size={18} />}
            </button>
            <div className={`overflow-hidden transition-all duration-200 ${showVolumeSlider ? "w-20" : "w-0"}`}>
              <input
                type="range" min={0} max={1} step={0.05}
                value={muted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-20 h-1 accent-white"
              />
            </div>
          </div>

          {/* Time */}
          <span className="text-xs tabular-nums ml-1">
            {formatDuration(Math.floor(currentTime))} / {formatDuration(Math.floor(duration))}
          </span>

          <div className="flex-1" />

          {/* Speed */}
          <div className="relative">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="flex items-center gap-1 px-2 py-0.5 rounded text-xs hover:bg-white/20 transition-colors"
              title="Settings"
            >
              <FiSettings size={14} /> {speed}x
            </button>
            {showSettings && (
              <div className="absolute bottom-8 right-0 bg-zinc-900 border border-zinc-700 rounded-xl py-1 w-32 shadow-xl">
                <p className="text-xs text-zinc-400 px-3 py-1 font-semibold">Playback speed</p>
                {SPEEDS.map((s) => (
                  <button
                    key={s}
                    onClick={() => handleSpeed(s)}
                    className={`w-full text-left px-3 py-1.5 text-sm hover:bg-zinc-800 transition-colors ${speed === s ? "text-red-400 font-semibold" : ""}`}
                  >
                    {s === 1 ? "Normal" : `${s}x`}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Theatre mode */}
          <button
            onClick={() => setTheatreMode(!theatreMode)}
            className="p-1 hover:text-red-400 transition-colors hidden lg:block"
            title="Theatre mode (T)"
          >
            <FiMinimize2 size={16} />
          </button>

          {/* Mini player */}
          <button
            onClick={handleMiniPlayer}
            className="p-1 hover:text-red-400 transition-colors"
            title="Mini player"
          >
            <FiMinimize size={16} />
          </button>

          {/* Fullscreen */}
          <button onClick={toggleFullscreen} className="p-1 hover:text-red-400 transition-colors" title="Fullscreen (F)">
            {fullscreen ? <FiMinimize size={18} /> : <FiMaximize size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
}
