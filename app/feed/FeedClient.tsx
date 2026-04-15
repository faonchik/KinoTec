"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";

interface Activity {
  id: string;
  type: string;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    avatar: string | null;
  };
  movie?: {
    id: string;
    title: string;
    poster: string | null;
  } | null;
  metadata?: {
    rating?: number;
    followingName?: string;
    achievementName?: string;
  } | null;
}

const activityMessages: Record<string, (a: Activity) => string> = {
  WATCHED_MOVIE: () => "посмотрел(а) фильм",
  RATED_MOVIE: (a) => `оценил(а) фильм на ${a.metadata?.rating || "?"}`,
  REVIEWED_MOVIE: () => "написал(а) отзыв на",
  ADDED_TO_WATCHLIST: () => "добавил(а) в список",
  ADDED_TO_FAVORITES: () => "добавил(а) в избранное",
  UNLOCKED_ACHIEVEMENT: (a) => `получил(а) достижение "${a.metadata?.achievementName}"`,
  FOLLOWED_USER: (a) => `подписался на ${a.metadata?.followingName}`,
};

const activityIcons: Record<string, string> = {
  WATCHED_MOVIE: "👁️",
  RATED_MOVIE: "⭐",
  REVIEWED_MOVIE: "✍️",
  ADDED_TO_WATCHLIST: "📋",
  ADDED_TO_FAVORITES: "❤️",
  UNLOCKED_ACHIEVEMENT: "🏆",
  FOLLOWED_USER: "👤",
};

export function FeedClient() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const fetchFeed = useCallback(async (cursor?: string) => {
    try {
      const params = new URLSearchParams();
      if (cursor) params.set("cursor", cursor);
      
      const res = await fetch(`/api/feed?${params.toString()}`);
      const data = await res.json();

      if (cursor) {
        setActivities((prev) => [...prev, ...data.activities]);
      } else {
        setActivities(data.activities);
      }
      setNextCursor(data.nextCursor);
    } catch (error) {
      console.error("Feed error:", error);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    fetchFeed();
  }, [fetchFeed]);

  const loadMore = () => {
    if (nextCursor && !isLoadingMore) {
      setIsLoadingMore(true);
      fetchFeed(nextCursor);
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes} мин назад`;
    if (hours < 24) return `${hours} ч назад`;
    if (days < 7) return `${days} д назад`;
    return date.toLocaleDateString("ru-RU");
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-slate-800 rounded-xl h-24" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">📰 Лента активности</h1>

        {activities.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">👀</div>
            <p className="text-slate-400 text-lg mb-4">Лента пуста</p>
            <p className="text-slate-500">
              Подпишитесь на пользователей, чтобы видеть их активность
            </p>
            <Link
              href="/users"
              className="inline-block mt-4 px-6 py-2 bg-amber-500 hover:bg-amber-400 text-black font-medium rounded-lg transition-colors"
            >
              Найти друзей
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 hover:border-slate-600/50 transition-colors"
              >
                <div className="flex items-start gap-4">
                  {/* Аватар */}
                  <Link href={`/users/${activity.user.id}`} className="flex-shrink-0">
                    {activity.user.avatar ? (
                      <Image
                        src={activity.user.avatar}
                        alt={activity.user.name || ""}
                        width={48}
                        height={48}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white font-bold text-lg">
                        {activity.user.name?.[0] || "?"}
                      </div>
                    )}
                  </Link>

                  {/* Контент */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Link
                        href={`/users/${activity.user.id}`}
                        className="font-semibold text-white hover:text-amber-400 transition-colors"
                      >
                        {activity.user.name || "Пользователь"}
                      </Link>
                      <span className="text-slate-400">
                        {activityMessages[activity.type]?.(activity) || activity.type}
                      </span>
                    </div>

                    {/* Фильм если есть */}
                    {activity.movie && (
                      <Link
                        href={`/movies/${activity.movie.id}`}
                        className="flex items-center gap-3 mt-2 p-2 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors"
                      >
                        {activity.movie.poster ? (
                          <Image
                            src={activity.movie.poster}
                            alt={activity.movie.title}
                            width={40}
                            height={60}
                            className="w-10 rounded object-cover"
                          />
                        ) : (
                          <div className="w-10 h-15 bg-slate-600 rounded flex items-center justify-center text-lg">
                            🎬
                          </div>
                        )}
                        <span className="text-white font-medium">
                          {activity.movie.title}
                        </span>
                      </Link>
                    )}

                    <p className="text-slate-500 text-sm mt-2">
                      {activityIcons[activity.type]} {formatTime(activity.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {/* Загрузить ещё */}
            {nextCursor && (
              <button
                onClick={loadMore}
                disabled={isLoadingMore}
                className="w-full py-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300 font-medium transition-colors disabled:opacity-50"
              >
                {isLoadingMore ? "Загрузка..." : "Загрузить ещё"}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

