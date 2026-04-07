import { useState, useEffect, useRef } from "react";
import api from "@/lib/api";
import { Link } from "react-router-dom";
import ShortPlayer from "@/components/video/ShortPlayer";
import { FiLoader } from "react-icons/fi";

export default function Shorts() {
  const [shorts, setShorts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const containerRef = useRef(null);

  const fetchShorts = async (pageNum) => {
    try {
      setLoading(true);
      const { data } = await api.get(`/videos/shorts?page=${pageNum}&limit=5`);
      if (data.length === 0) {
        setHasMore(false);
      } else {
        setShorts((prev) => (pageNum === 1 ? data : [...prev, ...data]));
      }
    } catch (err) {
      console.error("Failed to fetch shorts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShorts(1);
  }, []);

  const handleScroll = () => {
    if (!containerRef.current || loading || !hasMore) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    if (scrollTop + clientHeight >= scrollHeight - 300) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchShorts(nextPage);
    }
  };

  if (loading && shorts.length === 0) {
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <FiLoader className="animate-spin text-4xl text-blue-500" />
      </div>
    );
  }

  if (!loading && shorts.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center h-[80vh] text-center">
        <h2 className="text-2xl font-bold mb-4">No Shorts Found</h2>
        <p className="text-zinc-500 mb-6">Upload a short to get started!</p>
        <Link to="/upload" className="bg-blue-600 text-white px-6 py-2 rounded-full font-medium hover:bg-blue-700 transition">
          Upload Short
        </Link>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="h-[calc(100vh-4rem)] w-full overflow-y-auto snap-y snap-mandatory scrollbar-hide flex flex-col items-center pb-20"
    >
      {shorts.map((short, index) => (
        <div key={`${short._id}-${index}`} className="snap-start snap-always w-full h-[calc(100vh-4rem)] md:h-[calc(100vh-5rem)] flex items-center justify-center py-4">
          <ShortPlayer short={short} />
        </div>
      ))}
      {loading && (
        <div className="py-4">
          <FiLoader className="animate-spin text-2xl text-blue-500" />
        </div>
      )}
    </div>
  );
}
