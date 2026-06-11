"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";

interface User {
  id: string;
  name: string | null;
  avatar: string | null;
  bio: string | null;
  createdAt: Date;
  _count: {
    reviews: number;
    ratings: number;
    favorites: number;
    watchHistory: number;
    followers: number;
    following: number;
  };
}

interface UsersClientProps {
  users: User[];
}

export function UsersClient({ users }: UsersClientProps) {
  const { data: session } = useSession();
  const [searchQuery, setSearchQuery] = useState("");
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());
  const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set());
  const t = useTranslations("community");

  const filteredUsers = users.filter((user) =>
    user.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleFollow = async (userId: string) => {
    if (!session) return;

    setLoadingIds((prev) => new Set([...prev, userId]));

    try {
      if (followingIds.has(userId)) {
        await fetch(`/api/users/${userId}/follow`, { method: "DELETE" });
        setFollowingIds((prev) => {
          const next = new Set(prev);
          next.delete(userId);
          return next;
        });
      } else {
        await fetch(`/api/users/${userId}/follow`, { method: "POST" });
        setFollowingIds((prev) => new Set([...prev, userId]));
      }
    } catch (error) {
      console.error("Follow error:", error);
    } finally {
      setLoadingIds((prev) => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-2">👥 {t("title")}</h1>
        <p className="text-slate-400 mb-8">{t("subtitle")}</p>

        {/* Поиск */}
        <div className="mb-8">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("searchPlaceholder")}
            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        {/* Список пользователей */}
        <div className="grid md:grid-cols-2 gap-4">
          {filteredUsers.map((user) => {
            const isCurrentUser = session?.user?.id === user.id;
            const isFollowing = followingIds.has(user.id);
            const isLoading = loadingIds.has(user.id);

            return (
              <div
                key={user.id}
                className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50 hover:border-slate-600/50 transition-colors"
              >
                <div className="flex items-start gap-4">
                  {/* Аватар */}
                  <Link href={`/users/${user.id}`} className="flex-shrink-0">
                    {user.avatar ? (
                      <Image
                        src={user.avatar}
                        alt={user.name || ""}
                        width={64}
                        height={64}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white font-bold text-2xl">
                        {user.name?.[0] || "?"}
                      </div>
                    )}
                  </Link>

                  {/* Инфо */}
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/users/${user.id}`}
                      className="font-semibold text-white hover:text-amber-400 transition-colors"
                    >
                      {user.name || t("userDefaultName")}
                    </Link>

                    {user.bio && (
                      <p className="text-slate-400 text-sm mt-1 line-clamp-2">
                        {user.bio}
                      </p>
                    )}

                    {/* Статистика */}
                    <div className="flex flex-wrap gap-3 mt-3 text-sm">
                      <span className="text-slate-500">
                        {t.rich("watchedCount", {
                          count: user._count.watchHistory,
                          white: (chunks) => <span className="text-white">{chunks}</span>
                        })}
                      </span>
                      <span className="text-slate-500">
                        {t.rich("reviewsCount", {
                          count: user._count.reviews,
                          white: (chunks) => <span className="text-white">{chunks}</span>
                        })}
                      </span>
                      <span className="text-slate-500">
                        {t.rich("followersCount", {
                          count: user._count.followers,
                          white: (chunks) => <span className="text-white">{chunks}</span>
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Кнопка подписки */}
                  {session && !isCurrentUser && (
                    <button
                      onClick={() => handleFollow(user.id)}
                      disabled={isLoading}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${
                        isFollowing
                          ? "bg-slate-700 text-slate-300 hover:bg-slate-600"
                          : "bg-amber-500 text-black hover:bg-amber-400"
                      }`}
                    >
                      {isLoading
                        ? "..."
                        : isFollowing
                        ? t("unfollow")
                        : t("follow")}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-400">{t("notFound")}</p>
          </div>
        )}
      </div>
    </div>
  );
}

