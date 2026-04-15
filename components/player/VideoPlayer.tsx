"use client";

import { useVideoPlayer } from "./hooks/useVideoPlayer";
import { VideoControls } from "./VideoControls";

interface VideoPlayerProps {
  src: string;
  poster?: string;
  title?: string;
  initialProgress?: number;
  onProgress?: (progress: number) => void;
  onComplete?: () => void;
}

const qualities = ["4K", "1080p", "720p", "480p"];
const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2];

export function VideoPlayer({
  src,
  poster,
  title,
  initialProgress = 0,
  onProgress,
  onComplete,
}: VideoPlayerProps) {
  const player = useVideoPlayer({
    initialProgress,
    onProgress,
    onComplete,
  });

  const {
    videoRef,
    containerRef,
    isPlaying,
    showControls,
    duration,
    setCurrentTime,
    setDuration,
    setBuffered,
    setIsPlaying,
    setShowControls,
    showControlsTemporarily,
    togglePlay,
  } = player;

  return (
    <div
      ref={containerRef}
      className={`relative bg-black group ${player.isFullscreen ? "fixed inset-0 z-50" : "aspect-video rounded-xl overflow-hidden"}`}
      onMouseMove={showControlsTemporarily}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      {/* Видео */}
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className="w-full h-full object-contain"
        onClick={togglePlay}
        onTimeUpdate={() => {
          if (videoRef.current) {
            setCurrentTime(videoRef.current.currentTime);
          }
        }}
        onLoadedMetadata={() => {
          if (videoRef.current) {
            setDuration(videoRef.current.duration);
          }
        }}
        onProgress={() => {
          if (videoRef.current && videoRef.current.buffered.length > 0) {
            setBuffered(
              (videoRef.current.buffered.end(videoRef.current.buffered.length - 1) / duration) * 100
            );
          }
        }}
        onEnded={() => {
          setIsPlaying(false);
          player.onComplete?.();
        }}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />

      {/* Оверлей для паузы */}
      {!isPlaying && (
        <div
          className="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer"
          onClick={togglePlay}
        >
          <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors">
            <svg className="w-10 h-10 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      )}

      {/* Название фильма */}
      {title && showControls && (
        <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/80 to-transparent">
          <h2 className="text-white font-semibold text-lg">{title}</h2>
        </div>
      )}

      {/* Контролы */}
      <VideoControls player={player} qualities={qualities} speeds={speeds} />

      {/* Горячие клавиши подсказка */}
      <div className={`absolute top-4 right-4 bg-black/70 rounded-lg px-3 py-2 text-xs text-white transition-opacity ${showControls ? "opacity-100" : "opacity-0"}`}>
        <span className="text-slate-400">Space</span> — Play/Pause • 
        <span className="text-slate-400 ml-2">←/→</span> — ±10 сек • 
        <span className="text-slate-400 ml-2">F</span> — Fullscreen
      </div>
    </div>
  );
}
