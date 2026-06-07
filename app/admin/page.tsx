import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Админ-панель",
};

async function getStats() {
  const [movies, actors, directors, users, reviews, articles] = await Promise.all([
    prisma.movie.count(),
    prisma.actor.count(),
    prisma.director.count(),
    prisma.user.count(),
    prisma.review.count(),
    prisma.article.count(),
  ]);

  return { movies, actors, directors, users, reviews, articles };
}

async function getRecentActivity() {
  const [recentMovies, recentReviews, pendingReviews] = await Promise.all([
    prisma.movie.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: { id: true, title: true, createdAt: true },
    }),
    prisma.review.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, email: true } },
        movie: { select: { title: true } },
      },
    }),
    prisma.review.count({ where: { isApproved: false } }),
  ]);

  return { recentMovies, recentReviews, pendingReviews };
}

export default async function AdminPage() {
  const session = await getServerSession(authOptions);

  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "MODERATOR")) {
    redirect("/");
  }

  const [stats, activity] = await Promise.all([getStats(), getRecentActivity()]);

  const statCards = [
    { label: "Фильмов", value: stats.movies, icon: "🎬", color: "from-[#ffb84d]/20 to-transparent" },
    { label: "Пользователей", value: stats.users, icon: "👥", color: "from-blue-500/20 to-transparent" },
    { label: "Отзывов", value: stats.reviews, icon: "💬", color: "from-green-500/20 to-transparent" },
    { label: "Статей", value: stats.articles, icon: "📝", color: "from-purple-500/20 to-transparent" },
  ];

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-oswald text-3xl font-bold text-white">Панель администратора</h1>
          <p className="font-mono text-[13px] text-white/35 mt-1">
            Добро пожаловать, {session.user.name || session.user.email}
          </p>
        </div>
        <Link href="/admin/tmdb">
          <button className="flex items-center gap-2 bg-[#ffb84d] hover:bg-[#ffc56a] text-white font-mono text-[13px] font-semibold px-5 py-2.5 rounded-2xl transition-colors">
            🌐 Добавить фильм
          </button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {statCards.map((card) => (
          <div key={card.label} className={`bg-gradient-to-r ${card.color} bg-[#121821] rounded-2xl p-5 border border-white/[0.08]/50`}>
            <div className="flex items-center justify-between mb-3">
              <span className="font-mono text-[12px] text-white/45">{card.label}</span>
              <span className="text-xl">{card.icon}</span>
            </div>
            <p className="font-oswald text-3xl font-bold text-white">{card.value.toLocaleString()}</p>
          </div>
        ))}
      </div>

      {/* Table: Recent Movies */}
      <div className="bg-[#121821] rounded-2xl p-6 mb-8">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-oswald text-lg font-bold text-white">Управление фильмами</h2>
          <Link href="/admin/movies" className="font-mono text-[13px] text-[#ffb84d] hover:text-[#ffc56a]">
            Все →
          </Link>
        </div>

        <div className="space-y-0">
          {activity.recentMovies.map((movie) => (
            <Link
              key={movie.id}
              href={`/admin/movies/${movie.id}`}
              className="flex items-center justify-between py-3 border-b border-white/[0.08]/50 last:border-0 hover:bg-[#121821] -mx-2 px-2 rounded transition-colors group"
            >
              <span className="font-mono text-[13px] text-white group-hover:text-[#ffb84d] transition-colors">{movie.title}</span>
              <span className="font-mono text-[11px] text-white/35">
                {new Date(movie.createdAt).toLocaleDateString("ru-RU")}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid lg:grid-cols-2 gap-5">
        {/* Recent Reviews */}
        <div className="bg-[#121821] rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-oswald text-lg font-bold text-white">Последние действия</h2>
            <Link href="/admin/reviews" className="font-mono text-[13px] text-[#ffb84d] hover:text-[#ffc56a]">
              Все →
            </Link>
          </div>
          <div className="space-y-3">
            {activity.recentReviews.map((review) => (
              <div key={review.id} className="py-2 border-b border-white/[0.08]/50 last:border-0">
                <p className="font-mono text-[13px] text-white">{review.movie.title}</p>
                <p className="font-mono text-[11px] text-white/35 line-clamp-1 mt-0.5">{review.content}</p>
                <p className="font-mono text-[10px] text-[#3A4560] mt-1">
                  от {review.user.name || review.user.email}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-[#121821] rounded-2xl p-6">
          <h2 className="font-oswald text-lg font-bold text-white mb-4">Быстрые действия</h2>
          <div className="space-y-2">
            <Link href="/admin/tmdb" className="flex items-center gap-3 p-3 rounded-xl bg-[#0D1420] hover:bg-white/[0.08] transition-colors group">
              <span className="text-lg">🌐</span>
              <span className="font-mono text-[13px] text-white/45 group-hover:text-white transition-colors">Добавить фильм</span>
            </Link>
            <Link href="/admin/users" className="flex items-center gap-3 p-3 rounded-xl bg-[#0D1420] hover:bg-white/[0.08] transition-colors group">
              <span className="text-lg">👥</span>
              <span className="font-mono text-[13px] text-white/45 group-hover:text-white transition-colors">Управление пользователями</span>
            </Link>
            <Link href="/admin/reviews" className="flex items-center gap-3 p-3 rounded-xl bg-[#0D1420] hover:bg-white/[0.08] transition-colors group">
              <span className="text-lg">💬</span>
              <span className="font-mono text-[13px] text-white/45 group-hover:text-white transition-colors">Модерация отзывов</span>
            </Link>
            <Link href="/admin/articles" className="flex items-center gap-3 p-3 rounded-xl bg-[#0D1420] hover:bg-white/[0.08] transition-colors group">
              <span className="text-lg">📝</span>
              <span className="font-mono text-[13px] text-white/45 group-hover:text-white transition-colors">Добавить статью</span>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
