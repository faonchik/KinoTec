"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface FavoriteButtonProps {
  movieId: string;
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
  /** Прозрачная кнопка с обводкой на герое */
  variant?: "default" | "glass";
}

export function FavoriteButton({
  movieId,
  size = "md",
  showText = false,
  className = "",
  variant = "default",
}: FavoriteButtonProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (session?.user) {
      fetch(`/api/user/favorites/${movieId}`)
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
        .then((data) => setIsFavorite(data.isFavorite))
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
      const res = await fetch(`/api/user/favorites/${movieId}`, {
        method: isFavorite ? "DELETE" : "POST",
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Response is not JSON");
      }
      const data = await res.json();
      setIsFavorite(data.isFavorite);
    } catch (error) {
      console.error("Favorite error:", error);
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
      ? isFavorite
        ? "border border-white/30 bg-red-500 text-white hover:bg-red-600"
        : "border border-white/45 bg-black/30 text-white backdrop-blur-sm hover:bg-black/45 hover:text-white"
      : isFavorite
        ? "bg-red-500 text-white hover:bg-red-600"
        : "bg-slate-700/80 text-slate-300 hover:bg-slate-600 hover:text-white";

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className={`${showText ? "px-4 py-2" : sizeClasses[size]} flex items-center justify-center gap-2 rounded-full transition-all ${tone} ${
        isLoading ? "cursor-wait opacity-50" : ""
      } ${className}`}
      title={isFavorite ? "Remove from favorites" : "Add to favorites"}
    >
      <svg
        className={`${size === "sm" ? "w-4 h-4" : size === "lg" ? "w-6 h-6" : "w-5 h-5"}`}
        fill={isFavorite ? "currentColor" : "none"}
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
      {showText && (isFavorite ? "In favorites" : "Add to favorites")}
    </button>
  );
}

