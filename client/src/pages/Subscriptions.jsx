import { useEffect, useState } from "react";
import api from "@/lib/api";
import VideoCard from "@/components/video/VideoCard";
import { VideoGridSkeleton } from "@/components/ui/Skeleton";

export default function Subscriptions() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/users/feed").then(({ data }) => {
      setVideos(data);
      setLoading(false);
    });
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">📺 Subscriptions</h1>
      {loading ? (
        <VideoGridSkeleton />
      ) : videos.length === 0 ? (
        <div className="text-center py-20 text-zinc-500">
          <p className="text-lg font-semibold">No videos from subscriptions</p>
          <p className="text-sm mt-2">Subscribe to channels to see their latest videos here</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {videos.map((v) => <VideoCard key={v._id} video={v} />)}
        </div>
      )}
    </div>
  );
}
