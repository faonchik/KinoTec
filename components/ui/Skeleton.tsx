interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-slate-700/50 rounded ${className}`}
    />
  );
}

export function MovieCardSkeleton() {
  return (
    <div className="bg-slate-800/50 rounded-xl overflow-hidden border border-slate-700/50">
      <Skeleton className="aspect-[2/3] w-full" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <div className="flex gap-2">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function ArticleCardSkeleton() {
  return (
    <div className="bg-slate-800/50 rounded-xl overflow-hidden border border-slate-700/50">
      <Skeleton className="aspect-video w-full" />
      <div className="p-6 space-y-3">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  );
}

export function PersonCardSkeleton() {
  return (
    <div className="bg-slate-800/50 rounded-xl overflow-hidden border border-slate-700/50 p-4">
      <Skeleton className="w-24 h-24 rounded-full mx-auto" />
      <div className="mt-4 space-y-2 text-center">
        <Skeleton className="h-5 w-3/4 mx-auto" />
        <Skeleton className="h-4 w-1/2 mx-auto" />
      </div>
    </div>
  );
}

