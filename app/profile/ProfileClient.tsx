"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { AvatarUpload } from "@/components/profile/AvatarUpload";
import { getFrameClasses, getBackgroundStyle } from "@/lib/customization";
import { getProxiedImageUrl, shouldUseUnoptimized } from "@/lib/images";

interface ShopItem {
  id: string;
  type: string;
  value: string;
}

interface User {
  id: string;
  name: string | null;
  email: string;
  avatar: string | null;
  coins: number;
  profileFrame: string | null;
  profileBadge: string | null;
  nameColor: string | null;
  avatarEffect: string | null;
  chatBubble: string | null;
  emojiPack: string | null;
  profileBackground: string | null;
  theme: string | null;
  createdAt: Date;
  _count: {
    reviews: number;
    ratings: number;
    favorites: number;
    watchlists: number;
    achievements: number;
    watchHistory: number;
  };
  purchasedItems: Array<{
    isEquipped: boolean;
    item: ShopItem;
  }>;
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

interface ProfileClientProps {
  user: User;
  recentFavorites: Favorite[];
  recentWatchlist: Watchlist[];
}

export function ProfileClient({ user, recentFavorites, recentWatchlist }: ProfileClientProps) {
  const [avatar, setAvatar] = useState<string | null>(user.avatar);
  const [background, setBackground] = useState<string | null>(user.profileBackground);
  const [activeTab, setActiveTab] = useState<"favorites" | "watchlist" | "reviews" | "achievements">("favorites");
  const [isHoveringCover, setIsHoveringCover] = useState(false);
  const [isUploadingBackground, setIsUploadingBackground] = useState(false);
  const backgroundInputRef = useRef<HTMLInputElement>(null);
  const t = useTranslations("profile");

  // Слушаем события обновления фона
  useEffect(() => {
    const handleBackgroundUpdate = (event: CustomEvent) => {
      setBackground(event.detail.background);
    };

    window.addEventListener("backgroundUpdated", handleBackgroundUpdate as EventListener);
    return () => {
      window.removeEventListener("backgroundUpdated", handleBackgroundUpdate as EventListener);
    };
  }, []);

  const handleBackgroundSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Проверка типа файла
    if (!file.type.startsWith("image/")) {
      alert("Выберите изображение");
      return;
    }

    // Проверка размера (макс 6MB для фона)
    if (file.size > 6 * 1024 * 1024) {
      alert("Размер файла не должен превышать 6MB");
      return;
    }

    setIsUploadingBackground(true);

    try {
      // Читаем файл как base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;

        // Отправляем на сервер
        const res = await fetch("/api/user/background", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ background: base64String }),
        });

        if (!res.ok) {
          const contentType = res.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            const data = await res.json();
            alert(data.error || "Ошибка при загрузке");
          } else {
            alert("Ошибка при загрузке");
          }
        } else {
          const contentType = res.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            const data = await res.json();
            setBackground(data.background);
            // Уведомляем о необходимости обновить фон
            window.dispatchEvent(new CustomEvent("backgroundUpdated", { detail: { background: data.background } }));
          }
        }
        setIsUploadingBackground(false);
      };

      reader.onerror = () => {
        alert("Ошибка при чтении файла");
        setIsUploadingBackground(false);
      };

      reader.readAsDataURL(file);
    } catch {
      alert("Ошибка при загрузке фона");
      setIsUploadingBackground(false);
    }
  };

  const handleDeleteBackground = async () => {
    if (!confirm("Удалить фон профиля?")) return;

    setIsUploadingBackground(true);
    try {
      const res = await fetch("/api/user/background", {
        method: "DELETE",
      });

      if (!res.ok) {
        alert("Ошибка при удалении фона");
      } else {
        setBackground(null);
        window.dispatchEvent(new CustomEvent("backgroundUpdated", { detail: { background: null } }));
      }
    } catch {
      alert("Ошибка при удалении фона");
    } finally {
      setIsUploadingBackground(false);
    }
  };

  const frameClasses = getFrameClasses(user.profileFrame);
  const backgroundStyle = getBackgroundStyle(background);

  const tabs = [
    { id: "favorites" as const, label: "❤️ Избранное" },
    { id: "watchlist" as const, label: "📋 Смотреть" },
    { id: "reviews" as const, label: "✍️ Отзывы" },
    { id: "achievements" as const, label: "🏆 Достижения" },
  ];

  return (
    <div className="min-h-screen bg-[#151C2C]">
      {/* Cover Section */}
      <div 
        className="relative h-[340px]"
        onMouseEnter={() => setIsHoveringCover(true)}
        onMouseLeave={() => setIsHoveringCover(false)}
      >
        {/* Cover Image */}
        <div
          className="absolute inset-0 bg-gradient-to-b from-[#2A3550] to-[#151C2C]"
          style={backgroundStyle}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#151C2C]/70 to-[#151C2C]" />

        {/* Кнопка изменения фона */}
        <div className={`absolute top-4 right-4 z-20 transition-opacity duration-200 ${isHoveringCover ? "opacity-100" : "opacity-0"}`}>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => backgroundInputRef.current?.click()}
              disabled={isUploadingBackground}
              className="px-4 py-2 bg-[#FF8400]/90 hover:bg-[#FF8400] text-white font-mono text-[13px] font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 backdrop-blur-sm border border-white/20"
              title="Изменить фон"
            >
              {isUploadingBackground ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Загрузка...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Изменить фон
                </>
              )}
            </button>
            
            {background && (
              <button
                type="button"
                onClick={handleDeleteBackground}
                disabled={isUploadingBackground}
                className="px-3 py-2 bg-red-500/90 hover:bg-red-600/90 text-white font-mono text-[13px] font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 backdrop-blur-sm border border-white/20"
                title="Удалить фон"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        <input
          ref={backgroundInputRef}
          type="file"
          accept="image/*"
          onChange={handleBackgroundSelect}
          className="hidden"
        />

        {/* Avatar */}
        <div className="absolute left-12 bottom-[-30px] z-10">
          <div className={`rounded-full border-4 border-[#FF8400] ${frameClasses || ""}`} style={{ borderRadius: "50%" }}>
            <AvatarUpload
              currentAvatar={avatar}
              userName={user.name}
              userEmail={user.email}
              profileFrame={user.profileFrame}
              avatarEffect={user.avatarEffect}
              onAvatarChange={setAvatar}
            />
          </div>
        </div>
      </div>

      {/* Profile Info */}
      <div className="flex items-center justify-between px-12 pt-2 pl-[220px]">
        <div>
          <div className="flex items-center gap-2">
            <h1
              className="font-oswald text-3xl font-bold text-white"
              style={{
                color: user.nameColor || undefined,
                backgroundImage: user.nameColor?.startsWith("gradient")
                  ? "linear-gradient(45deg, #f59e0b, #ec4899, #8b5cf6)"
                  : undefined,
                WebkitBackgroundClip: user.nameColor?.startsWith("gradient") ? "text" : undefined,
                WebkitTextFillColor: user.nameColor?.startsWith("gradient") ? "transparent" : undefined,
              }}
            >
              {user.name || "Пользователь"}
            </h1>
            {user.profileBadge && <span className="text-2xl">{user.profileBadge}</span>}
          </div>
          <p className="font-mono text-[13px] text-[#8B95A8] mt-1">{user.email}</p>
          <div className="flex items-center gap-4 mt-1">
            <span className="font-mono text-[12px] text-[#5A6478]">
              📅 На сайте с {new Date(user.createdAt).toLocaleDateString("ru-RU", { year: "numeric", month: "long" })}
            </span>
            <span className="font-mono text-[12px] text-[#5A6478]">
              🌍 Россия
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/profile/edit">
            <button className="font-mono text-[13px] font-semibold text-white bg-[#FF8400] hover:bg-[#FF9F2E] px-5 py-2.5 rounded-2xl transition-colors">
              ✏️ Ред. профиль
            </button>
          </Link>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="flex items-center justify-around px-12 py-6 mt-4 border-t border-b border-[#2A3550]">
        <Link href="/profile/watchlist" className="text-center group">
          <p className="font-oswald text-2xl font-bold text-white group-hover:text-[#FF8400] transition-colors">{user._count.watchlists}</p>
          <p className="font-mono text-[11px] text-[#5A6478]">{t("watchlist")}</p>
        </Link>
        <div className="text-center">
          <p className="font-oswald text-2xl font-bold text-white">{user._count.ratings}</p>
          <p className="font-mono text-[11px] text-[#5A6478]">Оценок</p>
        </div>
        <Link href="/profile/favorites" className="text-center group">
          <p className="font-oswald text-2xl font-bold text-white group-hover:text-[#FF8400] transition-colors">{user._count.favorites}</p>
          <p className="font-mono text-[11px] text-[#5A6478]">{t("favorites")}</p>
        </Link>
        <div className="text-center">
          <p className="font-oswald text-2xl font-bold text-white">{user._count.reviews}</p>
          <p className="font-mono text-[11px] text-[#5A6478]">Отзывов</p>
        </div>
        <div className="text-center">
          <p className="font-oswald text-2xl font-bold text-[#FF8400]">{user.coins.toLocaleString()}</p>
          <p className="font-mono text-[11px] text-[#5A6478]">Монет</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex gap-8 px-12 py-8">
        {/* Left Column */}
        <div className="flex-1">
          {/* Tabs */}
          <div className="flex items-center gap-2 mb-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`font-mono text-[13px] font-medium px-4 py-2 rounded-2xl transition-colors ${
                  activeTab === tab.id
                    ? "bg-[#FF8400] text-white"
                    : "text-[#8B95A8] hover:text-white"
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
                <Link href="/profile/favorites" className="font-mono text-[13px] text-[#FF8400] hover:text-[#FF9F2E]">
                  Все →
                </Link>
              </div>
              {recentFavorites.length === 0 ? (
                <p className="font-mono text-[13px] text-[#5A6478] text-center py-8">{t("empty")}</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {recentFavorites.map((f) => (
                    <Link key={f.movie.id} href={`/movies/${f.movie.id}`} className="group">
                      <div className="relative aspect-[2/3] rounded-2xl overflow-hidden bg-[#1A2236]">
                        {f.movie.poster ? (
                          <Image
                            src={f.movie.poster}
                            alt={f.movie.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                            sizes="(max-width: 640px) 50vw, 25vw"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-[#1E2740] to-[#2A3550] flex items-center justify-center text-2xl">🎬</div>
                        )}
                        <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                          <h3 className="font-mono text-[12px] font-semibold text-white line-clamp-2 group-hover:text-[#FF8400] transition-colors">{f.movie.title}</h3>
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
                <Link href="/profile/watchlist" className="font-mono text-[13px] text-[#FF8400] hover:text-[#FF9F2E]">
                  Все →
                </Link>
              </div>
              {recentWatchlist.length === 0 ? (
                <p className="font-mono text-[13px] text-[#5A6478] text-center py-8">{t("empty")}</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {recentWatchlist.map((w) => (
                    <Link key={w.movie.id} href={`/movies/${w.movie.id}`} className="group">
                      <div className="relative aspect-[2/3] rounded-2xl overflow-hidden bg-[#1A2236]">
                        {w.movie.poster ? (
                          shouldUseUnoptimized(w.movie.poster) ? <img src={getProxiedImageUrl(w.movie.poster)!} alt={w.movie.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" /> : <Image src={getProxiedImageUrl(w.movie.poster)!} alt={w.movie.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width: 640px) 50vw, 25vw" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-[#1E2740] to-[#2A3550] flex items-center justify-center text-2xl">🎬</div>
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
            <div className="text-center py-12 bg-[#1A2236] rounded-2xl">
              <p className="font-mono text-[13px] text-[#5A6478]">Отзывы загружаются...</p>
            </div>
          )}

          {activeTab === "achievements" && (
            <div className="text-center py-12 bg-[#1A2236] rounded-2xl">
              <p className="font-mono text-[13px] text-[#5A6478]">
                🏆 {user._count.achievements} достижений разблокировано
              </p>
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="w-[320px] flex-shrink-0 space-y-6">
          {/* Recent Activity */}
          <div className="bg-[#1A2236] rounded-2xl p-5">
            <h3 className="font-oswald text-base font-bold text-white mb-4">Последняя активность</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#2A3550] flex items-center justify-center text-sm">⭐</div>
                <div>
                  <p className="font-mono text-[12px] text-white">Оценил фильм</p>
                  <p className="font-mono text-[10px] text-[#5A6478]">Недавно</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#2A3550] flex items-center justify-center text-sm">❤️</div>
                <div>
                  <p className="font-mono text-[12px] text-white">Добавил в избранное</p>
                  <p className="font-mono text-[10px] text-[#5A6478]">Недавно</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="bg-[#1A2236] rounded-2xl p-5">
            <h3 className="font-oswald text-base font-bold text-white mb-4">Быстрые действия</h3>
            <div className="space-y-2">
              <Link href="/profile/stats" className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#2A3550] transition-colors group">
                <span className="text-lg">📊</span>
                <span className="font-mono text-[12px] text-[#8B95A8] group-hover:text-white transition-colors">{t("stats")}</span>
              </Link>
              <Link href="/challenges" className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#2A3550] transition-colors group">
                <span className="text-lg">🎯</span>
                <span className="font-mono text-[12px] text-[#8B95A8] group-hover:text-white transition-colors">{t("challenges")}</span>
              </Link>
              <Link href="/profile/weekly-report" className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#2A3550] transition-colors group">
                <span className="text-lg">📈</span>
                <span className="font-mono text-[12px] text-[#8B95A8] group-hover:text-white transition-colors">Еженедельный отчёт</span>
              </Link>
              <Link href="/profile/export" className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#2A3550] transition-colors group">
                <span className="text-lg">📦</span>
                <span className="font-mono text-[12px] text-[#8B95A8] group-hover:text-white transition-colors">Экспорт/Импорт</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
