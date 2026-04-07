import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import api from "@/lib/api";
import VideoCard from "@/components/video/VideoCard";
import { VideoGridSkeleton } from "@/components/ui/Skeleton";
import { formatViews, timeAgo, avatarFallback } from "@/lib/utils";
import { FiGrid, FiList } from "react-icons/fi";

const CATEGORIES = ["All", "Music", "Gaming", "Education", "Sports", "News", "Entertainment", "Technology", "Other"];
const SORT_OPTIONS = [
  { value: "relevance", label: "Relevance" },
  { value: "date", label: "Upload date" },
  { value: "views", label: "View count" },
];

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get("q") || "";
  const category = searchParams.get("category") || "";
  const sort = searchParams.get("sort") || "relevance";
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState("grid");

  useEffect(() => {
    if (!q) return;
    setLoading(true);
    api.get("/videos/search", { params: { q, category: category || undefined, sort } })
      .then(({ data }) => setVideos(data))
      .finally(() => setLoading(false));
  }, [q, category, sort]);

  const updateParam = (key, value) => {
    const params = Object.fromEntries(searchParams);
    if (value) params[key] = value;
    else delete params[key];
    setSearchParams(params);
  };

  return (
    <div className="page-enter">
      {q && (
        <p className="text-sm text-zinc-500 mb-4">
          {loading ? "Searching..." : `${videos.length} results for`} <span className="font-semibold text-zinc-900 dark:text-zinc-100">"{q}"</span>
        </p>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide flex-1">
          {CATEGORIES.map((cat) => {
            const active = cat === "All" ? !category : category === cat;
            return (
              <button
                key={cat}
                onClick={() => updateParam("category", cat === "All" ? "" : cat)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                  active ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900" : "bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <select
            value={sort}
            onChange={(e) => updateParam("sort", e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm outline-none"
          >
            {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <div className="flex border border-zinc-300 dark:border-zinc-700 rounded-lg overflow-hidden">
            <button onClick={() => setViewMode("grid")} className={`p-2 transition-colors ${viewMode === "grid" ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900" : "hover:bg-zinc-100 dark:hover:bg-zinc-800"}`}>
              <FiGrid size={15} />
            </button>
            <button onClick={() => setViewMode("list")} className={`p-2 transition-colors ${viewMode === "list" ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900" : "hover:bg-zinc-100 dark:hover:bg-zinc-800"}`}>
              <FiList size={15} />
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <VideoGridSkeleton />
      ) : videos.length === 0 ? (
        <div className="text-center py-24">
          <p className="text-5xl mb-4">🔍</p>
          <p className="text-xl font-bold">{q ? "No results found" : "Search for videos"}</p>
          <p className="text-zinc-500 text-sm mt-2">{q ? "Try different keywords or remove filters" : "Type something in the search bar above"}</p>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8">
          {videos.map((v) => <VideoCard key={v._id} video={v} />)}
        </div>
      ) : (
        <div className="space-y-4">
          {videos.map((v) => (
            <Link key={v._id} to={`/watch/${v._id}`} className="flex gap-4 group p-3 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors">
              <div className="relative shrink-0 w-64 aspect-video rounded-xl overflow-hidden bg-zinc-200 dark:bg-zinc-800">
                <img src={v.thumbnail || "https://placehold.co/640x360/1a1a1a/666?text=No+Thumbnail"} alt={v.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              </div>
              <div className="flex-1 min-w-0 py-1">
                <h3 className="font-semibold text-base line-clamp-2 group-hover:text-blue-500 transition-colors">{v.title}</h3>
                <p className="text-xs text-zinc-500 mt-1">{formatViews(v.views)} views · {timeAgo(v.createdAt)}</p>
                <Link to={`/channel/${v.uploader?._id}`} className="flex items-center gap-2 mt-2 hover:text-blue-500 transition-colors">
                  <div className="w-6 h-6 rounded-full bg-zinc-400 overflow-hidden">
                    {v.uploader?.avatar ? <img src={v.uploader.avatar} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-white text-xs">{avatarFallback(v.uploader?.name)}</div>}
                  </div>
                  <span className="text-xs text-zinc-500">{v.uploader?.channelName || v.uploader?.name}</span>
                </Link>
                <p className="text-sm text-zinc-500 mt-2 line-clamp-2">{v.description}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
