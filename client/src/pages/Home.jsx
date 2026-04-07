import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams, Link } from "react-router-dom";
import api from "@/lib/api";
import VideoCard from "@/components/video/VideoCard";
import { VideoGridSkeleton } from "@/components/ui/Skeleton";
import { useAuthStore } from "@/store/authStore";
import { FiTrendingUp, FiUpload } from "react-icons/fi";

const CATEGORIES = ["All", "Music", "Gaming", "Education", "Sports", "News", "Entertainment", "Technology", "Other"];

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const category = searchParams.get("category") || "";
  const [videos, setVideos] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();
  const observer = useRef(null);
  const sentinelRef = useRef(null);

  const fetchVideos = useCallback(async (pg, cat) => {
    setLoading(true);
    try {
      const params = { page: pg, limit: 16 };
      if (cat) params.category = cat;
      const { data } = await api.get("/videos/feed", { params });
      setVideos((prev) => (pg === 1 ? data : [...prev, ...data]));
      setHasMore(data.length === 16);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setPage(1);
    setVideos([]);
    fetchVideos(1, category);
  }, [category, fetchVideos]);

  useEffect(() => {
    if (page === 1) return;
    fetchVideos(page, category);
  }, [page, category, fetchVideos]);

  useEffect(() => {
    observer.current = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && hasMore && !loading) setPage((p) => p + 1); },
      { threshold: 0.1 }
    );
    if (sentinelRef.current) observer.current.observe(sentinelRef.current);
    return () => observer.current?.disconnect();
  }, [hasMore, loading]);

  return (
    <div className="page-enter">
      {/* Sticky category chips */}
      <div className="sticky top-14 z-30 bg-white dark:bg-[#0f0f0f] py-3 -mx-4 md:-mx-6 px-4 md:px-6 mb-4 border-b border-zinc-100 dark:border-zinc-900">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {CATEGORIES.map((cat) => {
            const active = cat === "All" ? !category : category === cat;
            return (
              <button
                key={cat}
                onClick={() => setSearchParams(cat === "All" ? {} : { category: cat })}
                className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                  active
                    ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-sm"
                    : "bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Empty state */}
      {videos.length === 0 && !loading && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-20 h-20 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-4">
            <FiTrendingUp size={32} className="text-zinc-400" />
          </div>
          <h2 className="text-xl font-bold mb-2">No videos yet</h2>
          <p className="text-zinc-500 text-sm mb-6 max-w-xs">
            {category ? `No videos in "${category}" category yet.` : "Be the first to upload a video!"}
          </p>
          {user && (
            <Link
              to="/upload"
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors"
            >
              <FiUpload size={16} /> Upload Video
            </Link>
          )}
        </div>
      )}

      {/* Video grid */}
      {videos.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8">
          {videos.map((v) => <VideoCard key={v._id} video={v} />)}
        </div>
      )}

      {loading && <div className="mt-6"><VideoGridSkeleton count={page === 1 ? 16 : 4} /></div>}

      {!hasMore && videos.length > 0 && (
        <p className="text-center text-sm text-zinc-400 py-8">You've reached the end</p>
      )}

      <div ref={sentinelRef} className="h-4" />
    </div>
  );
}
