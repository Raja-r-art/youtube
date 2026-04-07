import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import VideoPlayer from "@/components/video/VideoPlayer";
import VideoCard from "@/components/video/VideoCard";
import CommentsSection from "@/components/video/CommentsSection";
import { WatchPageSkeleton } from "@/components/ui/Skeleton";
import { formatViews, timeAgo, avatarFallback } from "@/lib/utils";
import {
  FiThumbsUp, FiThumbsDown, FiShare2, FiChevronDown, FiChevronUp,
  FiList, FiCheck, FiPlus
} from "react-icons/fi";
import toast from "react-hot-toast";

export default function Watch() {
  const { id } = useParams();
  const { user } = useAuthStore();
  const [data, setData] = useState(null);
  const [suggested, setSuggested] = useState([]);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [subscribed, setSubscribed] = useState(false);
  const [subCount, setSubCount] = useState(0);
  const [descExpanded, setDescExpanded] = useState(false);
  const [playlistModal, setPlaylistModal] = useState(false);
  const [playlists, setPlaylists] = useState([]);
  const [likeAnim, setLikeAnim] = useState(false);

  useEffect(() => {
    setLoading(true);
    setDescExpanded(false);
    window.scrollTo(0, 0);
    Promise.all([
      api.get(`/videos/${id}`),
      api.get(`/videos/${id}/suggested`),
    ]).then(([vRes, sRes]) => {
      const d = vRes.data;
      setData(d);
      setLiked(d.isLiked);
      setDisliked(d.isDisliked);
      setLikeCount(d.video.likes.length);
      setSubscribed(d.isSubscribed);
      setSubCount(d.video.uploader.subscribers?.length || 0);
      setSuggested(sRes.data);
    }).catch(() => toast.error("Failed to load video"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleLike = async () => {
    if (!user) return toast.error("Sign in to like videos");
    try {
      setLikeAnim(true);
      setTimeout(() => setLikeAnim(false), 300);
      const { data: res } = await api.post(`/videos/${id}/like`);
      setLiked(res.liked);
      setDisliked(false);
      setLikeCount(res.likes);
    } catch { toast.error("Failed to like"); }
  };

  const handleDislike = async () => {
    if (!user) return toast.error("Sign in to dislike videos");
    try {
      const { data: res } = await api.post(`/videos/${id}/dislike`);
      setDisliked(res.disliked);
      setLiked(false);
      setLikeCount(res.likes);
    } catch { toast.error("Failed to dislike"); }
  };

  const handleSubscribe = async () => {
    if (!user) return toast.error("Sign in to subscribe");
    const { data: res } = await api.post(`/users/${data.video.uploader._id}/subscribe`);
    setSubscribed(res.subscribed);
    setSubCount(res.subscriberCount);
    toast.success(res.subscribed ? "Subscribed!" : "Unsubscribed");
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied to clipboard!");
  };

  const openPlaylistModal = async () => {
    if (!user) return toast.error("Sign in first");
    const { data } = await api.get(`/playlists/user/${user._id}`);
    setPlaylists(data);
    setPlaylistModal(true);
  };

  const addToPlaylist = async (playlistId) => {
    await api.post(`/playlists/${playlistId}/videos`, { videoId: id });
    toast.success("Added to playlist!");
    setPlaylistModal(false);
  };

  if (loading) return <WatchPageSkeleton />;
  if (!data) return <div className="text-center py-20 text-zinc-500">Video not found</div>;

  const { video } = data;
  const uploader = video.uploader;

  return (
    <div className="flex flex-col lg:flex-row gap-6 page-enter">
      {/* Main */}
      <div className="flex-1 min-w-0">
        <VideoPlayer
          url={video.url}
          thumbnail={video.thumbnail}
          title={video.title}
          videoId={video._id}
        />

        <h1 className="text-lg font-bold mt-4 leading-snug">{video.title}</h1>

        {/* Channel + actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 mt-3 pb-4 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <Link to={`/channel/${uploader._id}`}>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-orange-400 text-white flex items-center justify-center font-semibold overflow-hidden hover:ring-2 hover:ring-blue-500 transition-all">
                {uploader.avatar ? (
                  <img src={uploader.avatar} alt={uploader.name} className="w-full h-full object-cover" />
                ) : avatarFallback(uploader.name)}
              </div>
            </Link>
            <div>
              <Link to={`/channel/${uploader._id}`} className="font-semibold text-sm hover:text-blue-500 transition-colors block">
                {uploader.channelName || uploader.name}
              </Link>
              <p className="text-xs text-zinc-500">{formatViews(subCount)} subscribers</p>
            </div>
            <button
              onClick={handleSubscribe}
              className={`ml-1 px-5 py-2 rounded-full text-sm font-semibold transition-all ${
                subscribed
                  ? "bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600"
                  : "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:opacity-90"
              }`}
            >
              {subscribed ? <span className="flex items-center gap-1"><FiCheck size={14} /> Subscribed</span> : "Subscribe"}
            </button>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Like/Dislike */}
            <div className="flex rounded-full overflow-hidden border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800">
              <button
                onClick={handleLike}
                className={`flex items-center gap-1.5 px-4 py-2 text-sm hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors border-r border-zinc-200 dark:border-zinc-700 ${liked ? "text-blue-600 font-semibold" : ""}`}
              >
                <FiThumbsUp size={16} className={likeAnim ? "like-anim" : ""} />
                <span>{formatViews(likeCount)}</span>
              </button>
              <button
                onClick={handleDislike}
                className={`flex items-center gap-1.5 px-4 py-2 text-sm hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors ${disliked ? "text-red-500 font-semibold" : ""}`}
              >
                <FiThumbsDown size={16} />
              </button>
            </div>

            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
            >
              <FiShare2 size={15} /> Share
            </button>

            <button
              onClick={openPlaylistModal}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
            >
              <FiList size={15} /> Save
            </button>
          </div>
        </div>

        {/* Description box */}
        <div className="mt-4 bg-zinc-100 dark:bg-zinc-900 rounded-xl p-4 cursor-pointer" onClick={() => setDescExpanded(!descExpanded)}>
          <div className="flex items-center gap-3 text-sm font-medium mb-2 text-zinc-600 dark:text-zinc-400">
            <span>{formatViews(video.views)} views</span>
            <span>·</span>
            <span>{timeAgo(video.createdAt)}</span>
            {video.tags?.length > 0 && (
              <div className="flex gap-1 flex-wrap">
                {video.tags.slice(0, 4).map((t) => (
                  <span key={t} className="text-blue-500 hover:underline cursor-pointer">#{t}</span>
                ))}
              </div>
            )}
          </div>
          <p className={`text-sm whitespace-pre-wrap text-zinc-700 dark:text-zinc-300 ${!descExpanded ? "line-clamp-2" : ""}`}>
            {video.description || "No description provided."}
          </p>
          <button className="flex items-center gap-1 text-sm font-semibold mt-2 text-zinc-900 dark:text-white">
            {descExpanded ? <><FiChevronUp size={14} /> Show less</> : <><FiChevronDown size={14} /> Show more</>}
          </button>
        </div>

        <CommentsSection videoId={id} />
      </div>

      {/* Suggested */}
      <div className="w-full lg:w-96 shrink-0 space-y-3">
        <p className="text-sm font-semibold text-zinc-500 uppercase tracking-wide">Up next</p>
        {suggested.length === 0 ? (
          <p className="text-sm text-zinc-500">No suggestions available</p>
        ) : (
          suggested.map((v) => <VideoCard key={v._id} video={v} horizontal />)
        )}
      </div>

      {/* Save to Playlist Modal */}
      {playlistModal && (
        <>
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setPlaylistModal(false)}>
            <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-sm p-5" onClick={(e) => e.stopPropagation()}>
              <h3 className="font-bold text-lg mb-4">Save to playlist</h3>
              {playlists.length === 0 ? (
                <p className="text-sm text-zinc-500 mb-4">No playlists yet. Create one first.</p>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto mb-4">
                  {playlists.map((p) => (
                    <button
                      key={p._id}
                      onClick={() => addToPlaylist(p._id)}
                      className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-left"
                    >
                      <div className="w-12 aspect-video rounded-lg bg-zinc-200 dark:bg-zinc-700 overflow-hidden shrink-0">
                        {p.videos?.[0]?.thumbnail ? (
                          <img src={p.videos[0].thumbnail} className="w-full h-full object-cover" />
                        ) : <div className="w-full h-full flex items-center justify-center text-zinc-400 text-xs">Empty</div>}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{p.name}</p>
                        <p className="text-xs text-zinc-500">{p.videos?.length || 0} videos</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              <Link
                to="/playlists"
                onClick={() => setPlaylistModal(false)}
                className="flex items-center gap-2 text-sm text-blue-500 hover:underline"
              >
                <FiPlus size={14} /> Create new playlist
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
