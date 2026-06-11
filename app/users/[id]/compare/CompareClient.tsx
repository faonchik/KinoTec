"use client";

import Link from "next/link";
import Image from "next/image";
import { useTranslations } from "next-intl";

interface User {
  id: string;
  name: string | null;
  avatar: string | null;
}

interface Movie {
  id: string;
  title: string;
  poster: string | null;
  rating?: number;
}

interface CompareClientProps {
  currentUser: User;
  otherUser: User;
  comparison: {
    compatibility: number;
    commonMoviesCount: number;
    commonMovies: Array<{
      movie: { id: string; title: string; poster: string | null };
      rating1: number;
      rating2: number;
      diff: number;
    }>;
    biggestDisagreements: Array<{
      movie: { id: string; title: string; poster: string | null };
      rating1: number;
      rating2: number;
      diff: number;
    }>;
    currentUserGenres: Array<{ genre: string; avgRating: number; count: number }>;
    otherUserGenres: Array<{ genre: string; avgRating: number; count: number }>;
    recommendFromOther: Movie[];
    recommendToOther: Movie[];
  };
}

export function CompareClient({ currentUser, otherUser, comparison }: CompareClientProps) {
  const t = useTranslations("compare");

  const getCompatibilityEmoji = (value: number) => {
    if (value >= 80) return "🤝";
    if (value >= 60) return "👍";
    if (value >= 40) return "🤔";
    if (value >= 20) return "😐";
    return "😬";
  };

  const getCompatibilityColor = (value: number) => {
    if (value >= 80) return "from-green-500 to-emerald-600";
    if (value >= 60) return "from-lime-500 to-green-600";
    if (value >= 40) return "from-yellow-500 to-amber-600";
    if (value >= 20) return "from-orange-500 to-red-600";
    return "from-red-500 to-rose-600";
  };

  const getCompatibilityText = (value: number) => {
    if (value >= 80) return t("compatibilityText.excellent");
    if (value >= 60) return t("compatibilityText.good");
    if (value >= 40) return t("compatibilityText.average");
    if (value >= 20) return t("compatibilityText.different");
    return t("compatibilityText.opposite");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Заголовок */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-white mb-4">📊 {t("title")}</h1>
        
        {/* Аватары */}
        <div className="flex items-center justify-center gap-8 mb-8">
          <div className="text-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white font-bold text-2xl mx-auto mb-2">
              {currentUser.name?.[0] || "?"}
            </div>
            <p className="text-white font-medium">{currentUser.name}</p>
          </div>

          <div className="text-4xl">{t("vs")}</div>

          <Link href={`/users/${otherUser.id}`} className="text-center group">
            {otherUser.avatar ? (
              <Image
                src={otherUser.avatar}
                alt={otherUser.name || ""}
                width={80}
                height={80}
                className="rounded-full mx-auto mb-2"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-white font-bold text-2xl mx-auto mb-2">
                {otherUser.name?.[0] || "?"}
              </div>
            )}
            <p className="text-white font-medium group-hover:text-amber-400 transition-colors">
              {otherUser.name}
            </p>
          </Link>
        </div>

        {/* Совместимость */}
        <div className={`inline-block bg-gradient-to-r ${getCompatibilityColor(comparison.compatibility)} rounded-2xl p-8`}>
          <div className="text-6xl mb-2">{getCompatibilityEmoji(comparison.compatibility)}</div>
          <div className="text-5xl font-bold text-white mb-2">
            {comparison.compatibility.toFixed(0)}%
          </div>
          <p className="text-white/80 text-lg">{getCompatibilityText(comparison.compatibility)}</p>
          <p className="text-white/60 text-sm mt-2">
            {t("basedOn", { count: comparison.commonMoviesCount })}
          </p>
        </div>
      </div>

      {comparison.commonMoviesCount === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🎬</div>
          <p className="text-slate-400 text-lg mb-4">{t("noCommon")}</p>
          <p className="text-slate-500">{t("rateMore")}</p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Наибольшие совпадения */}
          <div className="bg-slate-800/50 rounded-xl p-6 border border-green-500/30">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <span>💚</span> {t("similarRatings")}
            </h2>
            <div className="space-y-3">
              {comparison.commonMovies.slice(0, 5).map((item) => (
                <Link
                  key={item.movie.id}
                  href={`/movies/${item.movie.id}`}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-700/30 transition-colors"
                >
                  <div className="relative w-10 h-15 flex-shrink-0 rounded overflow-hidden bg-slate-700">
                    {item.movie.poster ? (
                      <Image
                        src={item.movie.poster}
                        alt={item.movie.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">🎬</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium line-clamp-1">{item.movie.title}</p>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-amber-400">{item.rating1}</span>
                    <span className="text-slate-500">/</span>
                    <span className="text-blue-400">{item.rating2}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Наибольшие разногласия */}
          <div className="bg-slate-800/50 rounded-xl p-6 border border-red-500/30">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <span>💔</span> {t("disagreements")}
            </h2>
            <div className="space-y-3">
              {comparison.biggestDisagreements.map((item) => (
                <Link
                  key={item.movie.id}
                  href={`/movies/${item.movie.id}`}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-700/30 transition-colors"
                >
                  <div className="relative w-10 h-15 flex-shrink-0 rounded overflow-hidden bg-slate-700">
                    {item.movie.poster ? (
                      <Image
                        src={item.movie.poster}
                        alt={item.movie.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">🎬</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium line-clamp-1">{item.movie.title}</p>
                    <p className="text-red-400 text-xs">{t("difference", { count: item.diff })}</p>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-amber-400">{item.rating1}</span>
                    <span className="text-slate-500">{t("vs").toLowerCase()}</span>
                    <span className="text-blue-400">{item.rating2}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Жанровые предпочтения */}
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <span>🎭</span> {t("topGenres", { name: currentUser.name })}
            </h2>
            <div className="space-y-2">
              {comparison.currentUserGenres.map((g, idx) => (
                <div key={g.genre} className="flex items-center gap-3">
                  <span className="text-slate-500 w-4">{idx + 1}</span>
                  <span className="flex-1 text-slate-300">{g.genre}</span>
                  <span className="text-amber-400">★ {g.avgRating.toFixed(1)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <span>🎭</span> {t("topGenres", { name: otherUser.name })}
            </h2>
            <div className="space-y-2">
              {comparison.otherUserGenres.map((g, idx) => (
                <div key={g.genre} className="flex items-center gap-3">
                  <span className="text-slate-500 w-4">{idx + 1}</span>
                  <span className="flex-1 text-slate-300">{g.genre}</span>
                  <span className="text-blue-400">★ {g.avgRating.toFixed(1)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Рекомендации */}
          {comparison.recommendFromOther.length > 0 && (
            <div className="bg-slate-800/50 rounded-xl p-6 border border-amber-500/30">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span>💡</span> {t("recommends", { name: otherUser.name })}
              </h2>
              <div className="grid grid-cols-3 gap-3">
                {comparison.recommendFromOther.map((movie) => (
                  <Link key={movie.id} href={`/movies/${movie.id}`} className="group">
                    <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-slate-700">
                      {movie.poster ? (
                        <Image
                          src={movie.poster}
                          alt={movie.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl">🎬</div>
                      )}
                      <div className="absolute top-1 right-1 bg-black/70 rounded px-1.5 py-0.5 text-xs">
                        <span className="text-amber-400">★</span> {movie.rating}
                      </div>
                    </div>
                    <p className="text-white text-xs mt-1 line-clamp-1 group-hover:text-amber-400 transition-colors">
                      {movie.title}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {comparison.recommendToOther.length > 0 && (
            <div className="bg-slate-800/50 rounded-xl p-6 border border-blue-500/30">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span>💡</span> {t("youRecommend")}
              </h2>
              <div className="grid grid-cols-3 gap-3">
                {comparison.recommendToOther.map((movie) => (
                  <Link key={movie.id} href={`/movies/${movie.id}`} className="group">
                    <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-slate-700">
                      {movie.poster ? (
                        <Image
                          src={movie.poster}
                          alt={movie.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl">🎬</div>
                      )}
                      <div className="absolute top-1 right-1 bg-black/70 rounded px-1.5 py-0.5 text-xs">
                        <span className="text-amber-400">★</span> {movie.rating}
                      </div>
                    </div>
                    <p className="text-white text-xs mt-1 line-clamp-1 group-hover:text-amber-400 transition-colors">
                      {movie.title}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

