"use client";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#141414]/95 backdrop-blur-md">
      <div className="relative flex flex-col items-center justify-center p-8 rounded-2xl border border-white/[0.05] bg-black/40 shadow-2xl max-w-sm w-full mx-4 overflow-hidden">
        {/* Ambient glow in background */}
        <div className="absolute w-48 h-48 rounded-full bg-amber-500/10 blur-3xl -z-10 animate-pulse" />

        {/* Cinematic reel spinner */}
        <div className="relative mb-6">
          {/* Inner reel holes */}
          <div className="w-20 h-20 rounded-full border-4 border-dashed border-amber-500/30 animate-spin" style={{ animationDuration: "10s" }} />
          
          {/* Outer glowing track */}
          <div className="absolute inset-0 w-20 h-20 rounded-full border-2 border-transparent border-t-amber-500 border-b-orange-500 animate-spin" style={{ animationDuration: "1.2s" }} />
          
          {/* Center camera icon with glassmorphism */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-11 h-11 bg-white/[0.04] backdrop-blur-md border border-white/10 rounded-full flex items-center justify-center shadow-lg">
              <svg className="w-5 h-5 text-amber-400 animate-pulse" fill="currentColor" viewBox="0 0 24 24">
                <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H8V4h12v12zm-3-7l-3 3.75L12 9l-3 4h10l-2.25-3z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Loading text with shimmer effect */}
        <div className="flex flex-col items-center gap-2">
          <p className="text-sm font-semibold tracking-widest uppercase text-white/95 bg-gradient-to-r from-white via-amber-200 to-white bg-clip-text text-transparent animate-pulse">
            Загрузка
          </p>
          
          <div className="w-28 h-1 bg-white/10 rounded-full overflow-hidden mt-1 relative">
            <div className="absolute top-0 left-0 bottom-0 right-0 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full animate-progress-shimmer w-full origin-left" />
          </div>
        </div>
      </div>
    </div>
  );
}
