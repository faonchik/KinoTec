"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface RatingButtonProps {
  movieId: string;
  onRatingChange?: (rating: number | null) => void;
}

export function RatingButton({ movieId, onRatingChange }: RatingButtonProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [userRating, setUserRating] = useState<number | null>(null);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (session?.user) {
      fetch(`/api/user/rating/${movieId}`)
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
        .then((data) => setUserRating(data.rating))
        .catch(() => {});
    }
  }, [session, movieId]);

  const handleRate = async (value: number) => {
    if (!session) {
      router.push("/auth/signin");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch(`/api/user/rating/${movieId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value }),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Response is not JSON");
      }
      const data = await res.json();
      setUserRating(data.rating);
      onRatingChange?.(data.rating);
      setIsOpen(false);
    } catch (error) {
      console.error("Rating error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveRating = async () => {
    setIsLoading(true);

    try {
      await fetch(`/api/user/rating/${movieId}`, { method: "DELETE" });
      setUserRating(null);
      onRatingChange?.(null);
      setIsOpen(false);
    } catch (error) {
      console.error("Remove rating error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`px-4 py-2 rounded-full flex items-center gap-2 transition-all ${
          userRating
            ? "bg-amber-500 text-black hover:bg-amber-400"
            : "bg-slate-700/80 text-slate-300 hover:bg-slate-600 hover:text-white"
        }`}
      >
        <svg className="w-5 h-5" fill={userRating ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
          />
        </svg>
        {userRating ? `Моя оценка: ${userRating}` : "Оценить"}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full left-0 mt-2 z-50 bg-slate-800 rounded-xl border border-slate-700 p-4 shadow-xl min-w-[280px]">
            <p className="text-white font-medium mb-3 text-center">Ваша оценка</p>
            
            <div className="flex justify-center gap-1 mb-3">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
                <button
                  key={value}
                  onMouseEnter={() => setHoverRating(value)}
                  onMouseLeave={() => setHoverRating(null)}
                  onClick={() => handleRate(value)}
                  disabled={isLoading}
                  className={`w-7 h-7 rounded text-sm font-bold transition-all ${
                    (hoverRating !== null ? value <= hoverRating : value <= (userRating || 0))
                      ? "bg-amber-500 text-black"
                      : "bg-slate-700 text-slate-400 hover:bg-slate-600"
                  }`}
                >
                  {value}
                </button>
              ))}
            </div>

            <div className="text-center text-sm text-slate-400 mb-3">
              {hoverRating
                ? `Оценка: ${hoverRating}`
                : userRating
                ? `Текущая оценка: ${userRating}`
                : "Выберите оценку"}
            </div>

            {userRating && (
              <button
                onClick={handleRemoveRating}
                disabled={isLoading}
                className="w-full text-center text-red-400 hover:text-red-300 text-sm"
              >
                Удалить оценку
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}

