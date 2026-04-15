"use client";

import Link from "next/link";
import Image from "next/image";

interface Achievement {
  id: string;
  unlockedAt: Date;
  achievement: {
    name: string;
    description: string;
    icon: string;
    points: number;
  };
}

interface WatchedMovie {
  id: string;
  lastWatched: Date;
  movie: {
    id: string;
    title: string;
    poster?: string | null;
    runtime?: number | null;
  };
}

interface Rating {
  id: string;
  value: number;
  movie: {
    id: string;
    title: string;
  };
}

interface StatsClientProps {
  stats: {
    totalWatched: number;
    totalMinutes: number;
    reviews: number;
    favorites: number;
    watchlist: number;
    avgUserRating: number;
    achievements: Achievement[];
    genreStats: [string, number][];
    directorStats: [string, number][];
    yearStats: [string, number][];
    monthlyActivity: [string, number][];
    recentlyWatched: WatchedMovie[];
    ratings: Rating[];
  };
  userName: string;
}

export function StatsClient({ stats, userName }: StatsClientProps) {
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) {
      return `${days} д ${hours % 24} ч`;
    }
    return `${hours} ч ${minutes % 60} мин`;
  };

  const maxGenreValue = Math.max(...stats.genreStats.map(([, v]) => v));
  const maxMonthlyValue = Math.max(...stats.monthlyActivity.map(([, v]) => v));

  // Распределение оценок
  const ratingDistribution = Array(10).fill(0);
  stats.ratings.forEach((r) => {
    ratingDistribution[r.value - 1]++;
  });
  const maxRatingCount = Math.max(...ratingDistribution);

  const totalPoints = stats.achievements.reduce((acc, a) => acc + a.achievement.points, 0);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Заголовок */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">
          Статистика <span className="text-gradient">{userName}</span>
        </h1>
        <p className="text-slate-400">Ваша киноистория в цифрах</p>
      </div>

      {/* Основные метрики */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <div className="bg-gradient-to-br from-amber-500/20 to-orange-600/20 rounded-xl p-4 border border-amber-500/30">
          <p className="text-4xl font-bold text-white">{stats.totalWatched}</p>
          <p className="text-amber-400 text-sm">Просмотрено</p>
        </div>
        
        <div className="bg-gradient-to-br from-blue-500/20 to-cyan-600/20 rounded-xl p-4 border border-blue-500/30">
          <p className="text-4xl font-bold text-white">{formatTime(stats.totalMinutes)}</p>
          <p className="text-blue-400 text-sm">Время просмотра</p>
        </div>
        
        <div className="bg-gradient-to-br from-purple-500/20 to-pink-600/20 rounded-xl p-4 border border-purple-500/30">
          <p className="text-4xl font-bold text-white">{stats.reviews}</p>
          <p className="text-purple-400 text-sm">Отзывов</p>
        </div>
        
        <div className="bg-gradient-to-br from-red-500/20 to-rose-600/20 rounded-xl p-4 border border-red-500/30">
          <p className="text-4xl font-bold text-white">{stats.favorites}</p>
          <p className="text-red-400 text-sm">В избранном</p>
        </div>
        
        <div className="bg-gradient-to-br from-green-500/20 to-emerald-600/20 rounded-xl p-4 border border-green-500/30">
          <p className="text-4xl font-bold text-white">{stats.avgUserRating.toFixed(1)}</p>
          <p className="text-green-400 text-sm">Средняя оценка</p>
        </div>
        
        <div className="bg-gradient-to-br from-yellow-500/20 to-amber-600/20 rounded-xl p-4 border border-yellow-500/30">
          <p className="text-4xl font-bold text-white">{totalPoints}</p>
          <p className="text-yellow-400 text-sm">Очков</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 mb-8">
        {/* Любимые жанры */}
        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span>🎭</span> Любимые жанры
          </h2>
          <div className="space-y-3">
            {stats.genreStats.map(([genre, count]) => (
              <div key={genre} className="flex items-center gap-3">
                <span className="text-slate-300 w-24 text-sm truncate">{genre}</span>
                <div className="flex-1 h-6 bg-slate-700/50 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-orange-600 rounded-full flex items-center justify-end px-2"
                    style={{ width: `${(count / maxGenreValue) * 100}%` }}
                  >
                    <span className="text-xs font-bold text-white">{count}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Распределение оценок */}
        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span>⭐</span> Распределение оценок
          </h2>
          <div className="flex items-end justify-between h-40 gap-1">
            {ratingDistribution.map((count, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center">
                <div
                  className="w-full bg-gradient-to-t from-amber-500 to-yellow-400 rounded-t transition-all duration-500 hover:from-amber-400 hover:to-yellow-300"
                  style={{ height: maxRatingCount > 0 ? `${(count / maxRatingCount) * 100}%` : "0%" }}
                />
                <span className="text-xs text-slate-400 mt-2">{idx + 1}</span>
              </div>
            ))}
          </div>
          <p className="text-center text-slate-500 text-xs mt-2">Оценки от 1 до 10</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 mb-8">
        {/* Активность по месяцам */}
        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span>📈</span> Активность по месяцам
          </h2>
          {stats.monthlyActivity.length > 0 ? (
            <div className="flex items-end justify-between h-32 gap-2">
              {stats.monthlyActivity.map(([month, count]) => (
                <div key={month} className="flex-1 flex flex-col items-center">
                  <div
                    className="w-full bg-gradient-to-t from-blue-500 to-cyan-400 rounded-t transition-all duration-500 hover:from-blue-400 hover:to-cyan-300"
                    style={{ height: `${(count / maxMonthlyValue) * 100}%` }}
                  />
                  <span className="text-xs text-slate-400 mt-2 -rotate-45 origin-center whitespace-nowrap">
                    {month}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-center py-8">Начните смотреть фильмы!</p>
          )}
        </div>

        {/* Любимые режиссёры */}
        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span>🎬</span> Любимые режиссёры
          </h2>
          {stats.directorStats.length > 0 ? (
            <div className="space-y-4">
              {stats.directorStats.map(([director, count], idx) => (
                <div key={director} className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                    idx === 0 ? "bg-amber-500 text-black" :
                    idx === 1 ? "bg-slate-400 text-black" :
                    idx === 2 ? "bg-amber-700 text-white" :
                    "bg-slate-700 text-slate-300"
                  }`}>
                    {idx + 1}
                  </div>
                  <span className="flex-1 text-white">{director}</span>
                  <span className="text-slate-400">{count} фильмов</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-center py-8">Нет данных</p>
          )}
        </div>
      </div>

      {/* Достижения */}
      <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span>🏆</span> Достижения ({stats.achievements.length})
          </h2>
          <Link href="/profile/achievements" className="text-amber-400 hover:text-amber-300 text-sm">
            Все достижения →
          </Link>
        </div>
        
        {stats.achievements.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {stats.achievements.slice(0, 6).map((ua) => (
              <div
                key={ua.id}
                className="bg-slate-700/50 rounded-lg p-4 text-center hover:bg-slate-700 transition-colors"
                title={ua.achievement.description}
              >
                <div className="text-3xl mb-2">{ua.achievement.icon}</div>
                <p className="text-white text-sm font-medium">{ua.achievement.name}</p>
                <p className="text-amber-400 text-xs mt-1">+{ua.achievement.points}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-500 text-center py-8">
            Достижения появятся когда вы начнёте активнее пользоваться сайтом!
          </p>
        )}
      </div>

      {/* Недавно просмотренные */}
      {stats.recentlyWatched.length > 0 && (
        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span>📺</span> Недавно просмотренные
          </h2>
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
            {stats.recentlyWatched.map((wh) => (
              <Link key={wh.id} href={`/movies/${wh.movie.id}`} className="group">
                <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-slate-700">
                  {wh.movie.poster ? (
                    <Image
                      src={wh.movie.poster}
                      alt={wh.movie.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl">🎬</div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                    <p className="text-white text-xs line-clamp-2">{wh.movie.title}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

