export default function Loading() {
  return (
    <div className="min-h-screen bg-slate-950">
      <div className="w-full bg-black aspect-video animate-pulse" />
      <div className="container mx-auto px-4 py-8">
        <div className="h-8 bg-slate-800 rounded w-1/3 mb-4 animate-pulse" />
        <div className="h-4 bg-slate-800 rounded w-1/4 mb-8 animate-pulse" />
        <div className="space-y-4">
          <div className="h-4 bg-slate-800 rounded animate-pulse" />
          <div className="h-4 bg-slate-800 rounded w-5/6 animate-pulse" />
          <div className="h-4 bg-slate-800 rounded w-4/6 animate-pulse" />
        </div>
      </div>
    </div>
  );
}

