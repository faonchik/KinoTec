"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface AdminSidebarProps {
  username: string;
}

export default function AdminSidebar({ username }: AdminSidebarProps) {
  const pathname = usePathname();

  const sidebarItems = [
    { name: "Дашборд", href: "/admin", icon: "📊" },
    { name: "Фильмы", href: "/admin/movies", icon: "🎬" },
    { name: "Актёры", href: "/admin/actors", icon: "🎭" },
    { name: "Режиссёры", href: "/admin/directors", icon: "🎬" },
    { name: "Жанры", href: "/admin/genres", icon: "🏷️" },
    { name: "Пользователи", href: "/admin/users", icon: "👥" },
    { name: "Отзывы", href: "/admin/reviews", icon: "💬" },
    { name: "Статьи", href: "/admin/articles", icon: "📝" },
    { name: "Импорт TMDB", href: "/admin/tmdb", icon: "🌐" },
  ];

  return (
    <aside className="hidden md:flex w-[260px] bg-[#1a1a1a] border-r border-white/[0.08] py-6 flex-shrink-0 flex-col justify-between h-screen sticky top-0 z-20">
      <div>
        <div className="px-6 mb-6">
          <Link href="/" className="font-oswald text-xl font-bold text-[#ffb84d] tracking-wider flex items-center gap-2">
            🎬 КиноТека
          </Link>
          <span className="font-mono text-[10px] font-bold text-[#4B5A72] uppercase tracking-wider block mt-4">Навигация</span>
        </div>
        <nav className="space-y-1 px-3">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/admin" && pathname?.startsWith(item.href));
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-5 py-3 rounded-lg font-mono text-[13px] transition-colors ${
                  isActive
                    ? "bg-[#ffb84d] text-black font-bold"
                    : "text-white/45 hover:text-white hover:bg-white/[0.05]"
                }`}
              >
                <span>{item.icon}</span>
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="px-6 pt-6 border-t border-white/[0.08]">
        <div className="font-mono text-[11px] text-white/35">Вы вошли как:</div>
        <div className="font-mono text-[13px] text-white/80 truncate font-semibold mt-0.5">{username}</div>
        <Link href="/" className="inline-block mt-3 text-[12px] font-mono text-[#ffb84d] hover:underline">
          ← На главную
        </Link>
      </div>
    </aside>
  );
}
