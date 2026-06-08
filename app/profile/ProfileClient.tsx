"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { AvatarUpload } from "@/components/profile/AvatarUpload";
import { ProxiedImage } from "@/components/ui/ProxiedImage";
import { getProxiedImageUrl, shouldUseUnoptimized } from "@/lib/images";
import { Rating } from "@/components/ui/Rating";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { getBackgroundStyle } from "@/lib/customization";

interface User {
  id: string;
  name: string | null;
  email: string;
  avatar: string | null;
  createdAt: Date;
  profileBackground?: string | null;
  _count: {
    reviews: number;
    ratings: number;
    favorites: number;
    watchlists: number;
    watchHistory: number;
  };
}

interface Favorite {
  movie: {
    id: string;
    title: string;
    poster: string | null;
  };
}

interface Watchlist {
  movie: {
    id: string;
    title: string;
    poster: string | null;
  };
}

interface UserReview {
  id: string;
  type?: "review" | "comment";
  content: string;
  createdAt: Date;
  movie: {
    id: string;
    title: string;
    poster: string | null;
    ratings: {
      value: number;
    }[];
  };
}

interface ProfileClientProps {
  user: User;
  recentFavorites: Favorite[];
  recentWatchlist: Watchlist[];
  reviews: UserReview[];
}

export function ProfileClient({ user, recentFavorites, recentWatchlist, reviews }: ProfileClientProps) {
  const router = useRouter();
  const [avatar, setAvatar] = useState<string | null>(user.avatar);
  const [background, setBackground] = useState<string | null>(user.profileBackground || null);
  const [activeTab, setActiveTab] = useState<"favorites" | "watchlist" | "reviews">("favorites");
  const t = useTranslations("profile");

  useEffect(() => {
    const handleBgUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      setBackground(customEvent.detail?.background ?? null);
    };
    window.addEventListener("backgroundUpdated", handleBgUpdate);
    return () => window.removeEventListener("backgroundUpdated", handleBgUpdate);
  }, []);

  // Редактирование отзывов
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [editRating, setEditRating] = useState(0);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editError, setEditError] = useState("");

  const handleEditStart = (review: UserReview) => {
    setEditingId(review.id);
    setEditContent(review.content);
    setEditRating(review.movie.ratings?.[0]?.value || 0);
    setEditError("");
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditContent("");
    setEditRating(0);
    setEditError("");
  };

  const handleUpdate = async (e: React.FormEvent, reviewId: string) => {
    e.preventDefault();
    setEditError("");

    if (!editContent.trim()) {
      setEditError("Введите текст отзыва");
      return;
    }

    if (editContent.length < 10) {
      setEditError("Отзыв должен содержать минимум 10 символов");
      return;
    }

    if (editRating === 0) {
      setEditError("Выберите рейтинг");
      return;
    }

    setIsUpdating(true);

    try {
      const response = await fetch(`/api/reviews/${reviewId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: editContent, rating: editRating }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Ошибка при обновлении отзыва");
      }

      setEditingId(null);
      router.refresh();
    } catch (err) {
      setEditError(err instanceof Error ? err.message : "Ошибка при обновлении отзыва");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async (reviewId: string) => {
    if (!confirm("Вы уверены, что хотите удалить этот отзыв?")) return;

    try {
      const response = await fetch(`/api/reviews/${reviewId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Ошибка при удалении отзыва");
      }

      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Ошибка при удалении отзыва");
    }
  };

  const tabs = [
    { id: "favorites" as const, label: "❤️ Избранное" },
    { id: "watchlist" as const, label: "📋 Смотреть" },
    { id: "reviews" as const, label: "✍️ Отзывы и комментарии" },
  ];

  const backgroundStyle = getBackgroundStyle(background);

  return (
    <div className="min-h-screen bg-[#141414]">
      {/* Cover Section */}
      <div className="relative h-[160px] sm:h-[240px] lg:h-[340px]">
        {/* Cover Image */}
        {background ? (
          <div
            className="absolute inset-0 bg-cover bg-center transition-all duration-500"
            style={backgroundStyle}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-b from-[#121821] to-[#141414]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#141414]/70 to-[#141414]" />

        {/* Avatar */}
        <div className="absolute left-4 sm:left-8 lg:left-12 bottom-[-30px] z-10">
          <div className="rounded-full border-4 border-[#ffb84d] w-[104px] h-[104px] flex items-center justify-center flex-shrink-0 bg-[#141414]" style={{ borderRadius: "50%" }}>
            <AvatarUpload
              currentAvatar={avatar}
              userName={user.name}
              userEmail={user.email}
              onAvatarChange={setAvatar}
            />
          </div>
        </div>
      </div>

      {/* Profile Info */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-4 sm:px-8 lg:px-12 pt-[50px] sm:pt-2 sm:pl-[160px] lg:pl-[220px]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-oswald text-2xl sm:text-3xl font-bold text-white">
              {user.name || "Пользователь"}
            </h1>
          </div>
          <p className="font-mono text-[13px] text-white/45 mt-1">{user.email}</p>
          <div className="flex items-center gap-4 mt-1">
            <span className="font-mono text-[12px] text-white/35">
              📅 На сайте с {new Date(user.createdAt).toLocaleDateString("ru-RU", { year: "numeric", month: "long" })}
            </span>
            <span className="font-mono text-[12px] text-white/35">
              🌍 Россия
            </span>
          </div>
        </div>
        <div className="mt-3 sm:mt-0 flex items-center gap-3">
          <Link href="/profile/edit">
            <button className="font-mono text-[13px] font-semibold text-white bg-[#ffb84d] hover:bg-[#ffc56a] px-5 py-2.5 rounded-2xl transition-colors">
              ✏️ Ред. профиль
            </button>
          </Link>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="flex items-center justify-around px-4 sm:px-8 lg:px-12 py-4 sm:py-6 mt-4 border-t border-b border-white/[0.08] overflow-x-auto gap-4">
        <Link href="/profile/watchlist" className="text-center group">
          <p className="font-oswald text-2xl font-bold text-white group-hover:text-[#ffb84d] transition-colors">{user._count.watchlists}</p>
          <p className="font-mono text-[11px] text-white/35">{t("watchlist")}</p>
        </Link>
        <div className="text-center">
          <p className="font-oswald text-2xl font-bold text-white">{user._count.ratings}</p>
          <p className="font-mono text-[11px] text-white/35">Оценок</p>
        </div>
        <Link href="/profile/favorites" className="text-center group">
          <p className="font-oswald text-2xl font-bold text-white group-hover:text-[#ffb84d] transition-colors">{user._count.favorites}</p>
          <p className="font-mono text-[11px] text-white/35">{t("favorites")}</p>
        </Link>
        <div className="text-center">
          <p className="font-oswald text-2xl font-bold text-white">{user._count.reviews}</p>
          <p className="font-mono text-[11px] text-white/35">Отзывов</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row gap-6 px-4 sm:px-8 lg:px-12 py-6 sm:py-8">
        {/* Left Column */}
        <div className="flex-1 min-w-0">
          {/* Tabs */}
          <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1 scrollbar-none">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`font-mono text-[13px] font-medium px-3 sm:px-4 py-2 rounded-2xl transition-colors whitespace-nowrap flex-shrink-0 ${
                  activeTab === tab.id
                    ? "bg-[#ffb84d] text-white"
                    : "text-white/45 hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === "favorites" && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-oswald text-xl font-bold text-white">Избранные фильмы</h2>
                <Link href="/profile/favorites" className="font-mono text-[13px] text-[#ffb84d] hover:text-[#ffc56a]">
                  Все →
                </Link>
              </div>
              {recentFavorites.length === 0 ? (
                <p className="font-mono text-[13px] text-white/35 text-center py-8">{t("empty")}</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {recentFavorites.map((f) => (
                    <Link key={f.movie.id} href={`/movies/${f.movie.id}`} className="group">
                      <div className="relative aspect-[2/3] rounded-2xl overflow-hidden bg-[#121821]">
                        {f.movie.poster ? (
                          <ProxiedImage
                            src={f.movie.poster}
                            alt={f.movie.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                            sizes="(max-width: 640px) 50vw, 25vw"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-[#121821] to-[#141414] flex items-center justify-center text-2xl">🎬</div>
                        )}
                        <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                          <h3 className="font-mono text-[12px] font-semibold text-white line-clamp-2 group-hover:text-[#ffb84d] transition-colors">{f.movie.title}</h3>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "watchlist" && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-oswald text-xl font-bold text-white">Смотреть позже</h2>
                <Link href="/profile/watchlist" className="font-mono text-[13px] text-[#ffb84d] hover:text-[#ffc56a]">
                  Все →
                </Link>
              </div>
              {recentWatchlist.length === 0 ? (
                <p className="font-mono text-[13px] text-white/35 text-center py-8">{t("empty")}</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {recentWatchlist.map((w) => (
                    <Link key={w.movie.id} href={`/movies/${w.movie.id}`} className="group">
                      <div className="relative aspect-[2/3] rounded-2xl overflow-hidden bg-[#121821]">
                        {w.movie.poster ? (
                          shouldUseUnoptimized(w.movie.poster) ? <img src={getProxiedImageUrl(w.movie.poster)!} alt={w.movie.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" /> : <Image src={getProxiedImageUrl(w.movie.poster)!} alt={w.movie.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width: 640px) 50vw, 25vw" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-[#121821] to-[#141414] flex items-center justify-center text-2xl">🎬</div>
                        )}
                        <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                          <h3 className="font-mono text-[12px] font-semibold text-white line-clamp-2">{w.movie.title}</h3>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "reviews" && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-oswald text-xl font-bold text-white">Мои отзывы и комментарии</h2>
              </div>
              {reviews.length === 0 ? (
                <p className="font-mono text-[13px] text-white/35 text-center py-8">Вы еще не оставляли отзывов или комментариев.</p>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => {
                    const ratingValue = review.movie.ratings?.[0]?.value;
                    const isComment = review.type === "comment";
                    return (
                      <div key={review.id} className="bg-[#121821] rounded-2xl p-5 border border-white/[0.04] flex gap-4">
                        {/* Постер фильма */}
                        <Link href={`/movies/${review.movie.id}`} className="group flex-shrink-0">
                          <div className="relative w-16 aspect-[2/3] rounded-xl overflow-hidden bg-[#141414]">
                            {review.movie.poster ? (
                              <ProxiedImage
                                src={review.movie.poster}
                                alt={review.movie.title}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                                sizes="64px"
                              />
                            ) : (
                              <div className="w-full h-full bg-[#121821] flex items-center justify-center text-sm">🎬</div>
                            )}
                          </div>
                        </Link>
                        {/* Содержимое отзыва/комментария */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-4">
                                <Link href={`/movies/${review.movie.id}`} className="font-oswald text-base font-bold text-white hover:text-[#ffb84d] transition-colors truncate">
                                  {review.movie.title}
                                </Link>
                                {!isComment && editingId !== review.id && (
                                  <div className="flex gap-2 flex-shrink-0">
                                    <button
                                      onClick={() => handleEditStart(review)}
                                      className="text-xs text-white/40 hover:text-[#ffb84d] transition-colors font-mono"
                                    >
                                      ✏️ Ред.
                                    </button>
                                    <button
                                      onClick={() => handleDelete(review.id)}
                                      className="text-xs text-white/40 hover:text-red-400 transition-colors font-mono"
                                    >
                                      ❌ Удал.
                                    </button>
                                  </div>
                                )}
                              </div>
                              <div className="flex items-center gap-2 mt-0.5">
                                {isComment ? (
                                  <span className="font-mono text-[10px] px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded border border-blue-500/20">
                                    💬 Комментарий
                                  </span>
                                ) : (
                                  <>
                                    <span className="font-mono text-[10px] px-2 py-0.5 bg-[#ffb84d]/10 text-[#ffb84d] rounded border border-[#ffb84d]/20">
                                      ✍️ Отзыв
                                    </span>
                                    {ratingValue && (
                                      <div className="flex items-center gap-1">
                                        <span className="text-[#ffb84d] text-sm">★</span>
                                        <span className="font-mono text-xs text-white/80">{ratingValue} / 10</span>
                                      </div>
                                    )}
                                  </>
                                )}
                              </div>
                            </div>
                            <span className="font-mono text-[11px] text-white/35 whitespace-nowrap">
                              {new Date(review.createdAt).toLocaleDateString("ru-RU", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>

                          {editingId === review.id ? (
                            <form onSubmit={(e) => handleUpdate(e, review.id)} className="mt-2">
                              <div className="mb-3">
                                <label className="block text-xs font-medium text-white/45 mb-1">
                                  Ваша оценка
                                </label>
                                <Rating value={editRating} onChange={setEditRating} size="sm" />
                              </div>
                              <Textarea
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                rows={3}
                                className="mb-3"
                              />
                              {editError && <p className="text-red-400 text-xs mb-3">{editError}</p>}
                              <div className="flex gap-2">
                                <Button type="submit" size="sm" isLoading={isUpdating}>
                                  Сохранить
                                </Button>
                                <Button type="button" variant="ghost" size="sm" onClick={handleEditCancel}>
                                  Отмена
                                </Button>
                              </div>
                            </form>
                          ) : (
                            <p className="font-mono text-[13px] text-white/70 whitespace-pre-wrap">{review.content}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Right Sidebar */}
        <div className="w-full lg:w-[320px] flex-shrink-0 space-y-6">
          {/* Recent Activity */}
          <div className="bg-[#121821] rounded-2xl p-5">
            <h3 className="font-oswald text-base font-bold text-white mb-4">Последняя активность</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/[0.08] flex items-center justify-center text-sm">⭐</div>
                <div>
                  <p className="font-mono text-[12px] text-white">Оценил фильм</p>
                  <p className="font-mono text-[10px] text-white/35">Недавно</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/[0.08] flex items-center justify-center text-sm">❤️</div>
                <div>
                  <p className="font-mono text-[12px] text-white">Добавил в избранное</p>
                  <p className="font-mono text-[10px] text-white/35">Недавно</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="bg-[#121821] rounded-2xl p-5">
            <h3 className="font-oswald text-base font-bold text-white mb-4">Быстрые действия</h3>
            <div className="space-y-2">
              <Link href="/profile/stats" className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/[0.08] transition-colors group">
                <span className="text-lg">📊</span>
                <span className="font-mono text-[12px] text-white/45 group-hover:text-white transition-colors">{t("stats")}</span>
              </Link>
              <Link href="/profile/weekly-report" className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/[0.08] transition-colors group">
                <span className="text-lg">📈</span>
                <span className="font-mono text-[12px] text-white/45 group-hover:text-white transition-colors">Еженедельный отчёт</span>
              </Link>
              <Link href="/profile/export" className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/[0.08] transition-colors group">
                <span className="text-lg">📦</span>
                <span className="font-mono text-[12px] text-white/45 group-hover:text-white transition-colors">Экспорт/Импорт</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
