import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import VideoCard from "@/components/video/VideoCard";
import { ChannelSkeleton } from "@/components/ui/Skeleton";
import { formatViews, avatarFallback } from "@/lib/utils";
import { FiCheck, FiBell } from "react-icons/fi";
import toast from "react-hot-toast";

const TABS = ["Videos", "Playlists", "About"];

export default function Channel() {
  const { id } = useParams();
  const { user } = useAuthStore();
  const [channel, setChannel] = useState(null);
  const [videos, setVideos] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [subscribed, setSubscribed] = useState(false);
  const [subCount, setSubCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("Videos");

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get(`/users/${id}`),
      api.get(`/playlists/user/${id}`),
    ]).then(([uRes, pRes]) => {
      setChannel(uRes.data.user);
      setVideos(uRes.data.videos);
      setPlaylists(pRes.data);
      setSubCount(uRes.data.user.subscriberCount || 0);
    }).finally(() => setLoading(false));
  }, [id]);

  const handleSubscribe = async () => {
    if (!user) return toast.error("Sign in to subscribe");
    const { data } = await api.post(`/users/${id}/subscribe`);
    setSubscribed(data.subscribed);
    setSubCount(data.subscriberCount);
    toast.success(data.subscribed ? "Subscribed!" : "Unsubscribed");
  };

  if (loading) return <ChannelSkeleton />;
  if (!channel) return <div className="text-center py-20 text-zinc-500">Channel not found</div>;

  const isOwner = user?._id === id;

  return (
    <div className="page-enter">
      {/* Banner */}
      <div className="h-36 md:h-48 rounded-2xl overflow-hidden bg-gradient-to-r from-red-600 via-orange-500 to-yellow-400 relative">
        {channel.channelBanner && (
          <img src={channel.channelBanner} alt="Banner" className="w-full h-full object-cover" />
        )}
      </div>

      {/* Channel info */}
      <div className="flex flex-wrap items-start gap-5 px-2 mt-4 mb-6">
        <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-red-500 to-orange-400 text-white flex items-center justify-center text-3xl font-bold overflow-hidden shrink-0 ring-4 ring-white dark:ring-zinc-900 -mt-10 md:-mt-12">
          {channel.avatar ? (
            <img src={channel.avatar} alt={channel.name} className="w-full h-full object-cover" />
          ) : avatarFallback(channel.name)}
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold">{channel.channelName || channel.name}</h1>
          <p className="text-sm text-zinc-500 mt-0.5">
            @{(channel.channelName || channel.name).toLowerCase().replace(/\s/g, "")} · {formatViews(subCount)} subscribers · {videos.length} videos
          </p>
          {channel.bio && (
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2 max-w-2xl line-clamp-2">{channel.bio}</p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {isOwner ? (
            <Link to="/profile" className="px-5 py-2 rounded-full border border-zinc-300 dark:border-zinc-700 text-sm font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
              Customize channel
            </Link>
          ) : (
            <>
              <button
                onClick={handleSubscribe}
                className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold transition-all ${
                  subscribed
                    ? "bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600"
                    : "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:opacity-90"
                }`}
              >
                {subscribed ? <><FiCheck size={14} /> Subscribed</> : "Subscribe"}
              </button>
              {subscribed && (
                <button className="p-2 rounded-full border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                  <FiBell size={16} />
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-zinc-200 dark:border-zinc-800 mb-6 gap-1">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-3 text-sm font-semibold transition-colors border-b-2 -mb-px ${
              tab === t
                ? "border-zinc-900 dark:border-white text-zinc-900 dark:text-white"
                : "border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === "Videos" && (
        videos.length === 0 ? (
          <div className="text-center py-16 text-zinc-500">
            <p className="text-lg font-semibold">No videos yet</p>
            {isOwner && <Link to="/upload" className="text-blue-500 hover:underline text-sm mt-2 block">Upload your first video</Link>}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8">
            {videos.map((v) => <VideoCard key={v._id} video={{ ...v, uploader: channel }} />)}
          </div>
        )
      )}

      {tab === "Playlists" && (
        playlists.length === 0 ? (
          <div className="text-center py-16 text-zinc-500">No playlists yet</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {playlists.map((p) => (
              <Link key={p._id} to={`/playlists`} className="group">
                <div className="aspect-video rounded-xl overflow-hidden bg-zinc-200 dark:bg-zinc-800 relative">
                  {p.videos?.[0]?.thumbnail ? (
                    <img src={p.videos[0].thumbnail} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : <div className="w-full h-full flex items-center justify-center text-zinc-400">Empty</div>}
                  <div className="absolute bottom-0 right-0 bg-black/80 text-white text-xs px-2 py-1 rounded-tl-lg">
                    {p.videos?.length || 0} videos
                  </div>
                </div>
                <p className="text-sm font-semibold mt-2 line-clamp-1">{p.name}</p>
                <p className="text-xs text-zinc-500">{p.visibility}</p>
              </Link>
            ))}
          </div>
        )
      )}

      {tab === "About" && (
        <div className="max-w-2xl space-y-6">
          <div>
            <h3 className="font-semibold mb-2">Description</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 whitespace-pre-wrap">{channel.bio || "No description provided."}</p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Stats</h3>
            <div className="space-y-1 text-sm text-zinc-600 dark:text-zinc-400">
              <p>{formatViews(subCount)} subscribers</p>
              <p>{videos.length} videos</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
