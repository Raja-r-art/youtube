const S = ({ className }) => <div className={`skeleton rounded-lg ${className}`} />;

export function VideoCardSkeleton() {
  return (
    <div>
      <S className="aspect-video rounded-xl w-full" />
      <div className="flex gap-3 mt-3">
        <S className="w-9 h-9 rounded-full shrink-0" />
        <div className="flex-1 space-y-2 pt-1">
          <S className="h-4 w-full" />
          <S className="h-3 w-2/3" />
          <S className="h-3 w-1/2" />
        </div>
      </div>
    </div>
  );
}

export function VideoGridSkeleton({ count = 12 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8">
      {Array.from({ length: count }).map((_, i) => <VideoCardSkeleton key={i} />)}
    </div>
  );
}

export function WatchPageSkeleton() {
  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <div className="flex-1 min-w-0">
        <S className="aspect-video w-full rounded-xl" />
        <div className="mt-4 space-y-3">
          <S className="h-6 w-3/4" />
          <div className="flex items-center gap-3 pt-2">
            <S className="w-10 h-10 rounded-full" />
            <div className="space-y-2 flex-1">
              <S className="h-4 w-40" />
              <S className="h-3 w-24" />
            </div>
          </div>
          <S className="h-24 w-full rounded-xl" />
        </div>
      </div>
      <div className="w-full lg:w-96 space-y-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex gap-2">
            <S className="w-40 aspect-video rounded-xl shrink-0" />
            <div className="flex-1 space-y-2 pt-1">
              <S className="h-3 w-full" />
              <S className="h-3 w-2/3" />
              <S className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ChannelSkeleton() {
  return (
    <div>
      <S className="h-48 w-full rounded-xl" />
      <div className="flex gap-4 items-center mt-4 px-2">
        <S className="w-20 h-20 rounded-full shrink-0" />
        <div className="space-y-2 flex-1">
          <S className="h-6 w-48" />
          <S className="h-4 w-32" />
          <S className="h-4 w-64" />
        </div>
      </div>
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => <VideoCardSkeleton key={i} />)}
      </div>
    </div>
  );
}
