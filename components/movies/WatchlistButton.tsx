"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface WatchlistButtonProps {
  movieId: string;
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
  variant?: "default" | "glass";
}

export function WatchlistButton({
  movieId,
  size = "md",
  showText = false,
  className = "",
  variant = "default",
}: WatchlistButtonProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [inWatchlist, setInWatchlist] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (session?.user) {
      fetch(`/api/user/watchlist/${movieId}`)
        .then((res) => {
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
          }
          const contentType = res.headers.get("content-type");
          if (!contentType || !contentType.includes("application/json")) {
            throw new Error("Response is not JSON");
          }
          return res.json();
        })
        .then((data) => setInWatchlist(data.inWatchlist))
        .catch(() => {});
    }
  }, [session, movieId]);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!session) {
      router.push("/auth/signin");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch(`/api/user/watchlist/${movieId}`, {
        method: inWatchlist ? "DELETE" : "POST",
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Response is not JSON");
      }
      const data = await res.json();
      setInWatchlist(data.inWatchlist);
    } catch (error) {
      console.error("Watchlist error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const sizeClasses = {
    sm: "w-8 h-8 text-sm",
    md: "w-10 h-10 text-base",
    lg: "w-12 h-12 text-lg",
  };

  const tone =
    variant === "glass" && !showText
      ? inWatchlist
        ? "border border-white/30 bg-amber-500 text-black hover:bg-amber-400"
        : "border border-white/45 bg-black/30 text-white backdrop-blur-sm hover:bg-black/45 hover:text-white"
      : inWatchlist
        ? "bg-amber-500 text-black hover:bg-amber-400"
        : "bg-slate-700/80 text-slate-300 hover:bg-slate-600 hover:text-white";

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className={`${showText ? "px-4 py-2" : sizeClasses[size]} flex items-center justify-center gap-2 rounded-full transition-all ${tone} ${
        isLoading ? "cursor-wait opacity-50" : ""
      } ${className}`}
      title={inWatchlist ? "Remove from watchlist" : "Add to watchlist"}
    >
      <svg
        className={`${size === "sm" ? "w-4 h-4" : size === "lg" ? "w-6 h-6" : "w-5 h-5"}`}
        fill={inWatchlist ? "currentColor" : "none"}
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
        />
      </svg>
      {showText && (inWatchlist ? "In watchlist" : "Add to watchlist")}
    </button>
  );
}

