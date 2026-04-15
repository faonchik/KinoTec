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

  const sidebarItems = [
    { name: "Дашборд", href: "/admin", icon: "📊", active: true },
    { name: "Фильмы", href: "/admin/movies", icon: "🎬" },
    { name: "Актёры", href: "/admin/actors", icon: "🎭" },
    { name: "Пользователи", href: "/admin/users", icon: "👥" },
    { name: "Отзывы", href: "/admin/reviews", icon: "💬" },
    { name: "Статьи", href: "/admin/articles", icon: "📝" },
    { name: "Магазин", href: "/admin/shop", icon: "🏪" },
  ];

  const statCards = [
    { label: "Фильмов", value: stats.movies, icon: "🎬", color: "from-[#FF8400]/20 to-transparent" },
    { label: "Пользователей", value: stats.users, icon: "👥", color: "from-blue-500/20 to-transparent" },
    { label: "Отзывов", value: stats.reviews, icon: "💬", color: "from-green-500/20 to-transparent" },
    { label: "Статей", value: stats.articles, icon: "📝", color: "from-purple-500/20 to-transparent" },
  ];

  return (
    <div className="flex min-h-screen bg-[#151C2C]">
      {/* Sidebar */}
      <aside className="w-[240px] bg-[#0D1420] py-6 flex-shrink-0">
        <div className="px-5 mb-6">
          <span className="font-mono text-[10px] font-bold text-[#4B5A72] uppercase tracking-wider">Навигация</span>
        </div>
        <nav className="space-y-1 px-3">
          {sidebarItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-5 py-3 rounded-lg font-mono text-[13px] transition-colors ${
                item.active
                  ? "bg-[#FF8400] text-white font-semibold"
                  : "text-[#8B95A8] hover:text-white hover:bg-[#1A2236]"
              }`}
            >
              <span>{item.icon}</span>
              {item.name}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-oswald text-3xl font-bold text-white">Панель администратора</h1>
            <p className="font-mono text-[13px] text-[#5A6478] mt-1">
              Добро пожаловать, {session.user.name || session.user.email}
            </p>
          </div>
          <Link href="/admin/tmdb">
            <button className="flex items-center gap-2 bg-[#FF8400] hover:bg-[#FF9F2E] text-white font-mono text-[13px] font-semibold px-5 py-2.5 rounded-2xl transition-colors">
              🌐 Добавить фильм
            </button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {statCards.map((card) => (
            <div key={card.label} className={`bg-gradient-to-r ${card.color} bg-[#1A2236] rounded-2xl p-5 border border-[#2A3550]/50`}>
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-[12px] text-[#8B95A8]">{card.label}</span>
                <span className="text-xl">{card.icon}</span>
              </div>
              <p className="font-oswald text-3xl font-bold text-white">{card.value.toLocaleString()}</p>
            </div>
          ))}
        </div>

        {/* Table: Recent Movies */}
        <div className="bg-[#1A2236] rounded-2xl p-6 mb-8">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-oswald text-lg font-bold text-white">Управление фильмами</h2>
            <Link href="/admin/movies" className="font-mono text-[13px] text-[#FF8400] hover:text-[#FF9F2E]">
              Все →
            </Link>
          </div>

          <div className="space-y-0">
            {activity.recentMovies.map((movie) => (
              <Link
                key={movie.id}
                href={`/admin/movies/${movie.id}`}
                className="flex items-center justify-between py-3 border-b border-[#2A3550]/50 last:border-0 hover:bg-[#1E2740] -mx-2 px-2 rounded transition-colors group"
              >
                <span className="font-mono text-[13px] text-white group-hover:text-[#FF8400] transition-colors">{movie.title}</span>
                <span className="font-mono text-[11px] text-[#5A6478]">
                  {new Date(movie.createdAt).toLocaleDateString("ru-RU")}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid lg:grid-cols-2 gap-5">
          {/* Recent Reviews */}
          <div className="bg-[#1A2236] rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-oswald text-lg font-bold text-white">Последние действия</h2>
              <Link href="/admin/reviews" className="font-mono text-[13px] text-[#FF8400] hover:text-[#FF9F2E]">
                Все →
              </Link>
            </div>
            <div className="space-y-3">
              {activity.recentReviews.map((review) => (
                <div key={review.id} className="py-2 border-b border-[#2A3550]/50 last:border-0">
                  <p className="font-mono text-[13px] text-white">{review.movie.title}</p>
                  <p className="font-mono text-[11px] text-[#5A6478] line-clamp-1 mt-0.5">{review.content}</p>
                  <p className="font-mono text-[10px] text-[#3A4560] mt-1">
                    от {review.user.name || review.user.email}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-[#1A2236] rounded-2xl p-6">
            <h2 className="font-oswald text-lg font-bold text-white mb-4">Быстрые действия</h2>
            <div className="space-y-2">
              <Link href="/admin/tmdb" className="flex items-center gap-3 p-3 rounded-xl bg-[#0D1420] hover:bg-[#2A3550] transition-colors group">
                <span className="text-lg">🌐</span>
                <span className="font-mono text-[13px] text-[#8B95A8] group-hover:text-white transition-colors">Добавить фильм</span>
              </Link>
              <Link href="/admin/users" className="flex items-center gap-3 p-3 rounded-xl bg-[#0D1420] hover:bg-[#2A3550] transition-colors group">
                <span className="text-lg">👥</span>
                <span className="font-mono text-[13px] text-[#8B95A8] group-hover:text-white transition-colors">Управление пользователями</span>
              </Link>
              <Link href="/admin/reviews" className="flex items-center gap-3 p-3 rounded-xl bg-[#0D1420] hover:bg-[#2A3550] transition-colors group">
                <span className="text-lg">💬</span>
                <span className="font-mono text-[13px] text-[#8B95A8] group-hover:text-white transition-colors">Модерация отзывов</span>
              </Link>
              <Link href="/admin/articles" className="flex items-center gap-3 p-3 rounded-xl bg-[#0D1420] hover:bg-[#2A3550] transition-colors group">
                <span className="text-lg">📝</span>
                <span className="font-mono text-[13px] text-[#8B95A8] group-hover:text-white transition-colors">Добавить статью</span>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
