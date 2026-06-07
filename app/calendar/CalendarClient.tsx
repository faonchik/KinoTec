"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { getProxiedImageUrl, shouldUseUnoptimized } from "@/lib/images";

interface Movie {
  id: string;
  title: string;
  originalTitle?: string | null;
  poster?: string | null;
  backdrop?: string | null;
  releaseDate?: Date | null;
  description?: string | null;
  genres: { genre: { name: string; slug: string } }[];
  director?: { name: string } | null;
  ratings?: { value: number }[];
}

interface CalendarClientProps {
  upcoming: Movie[];
  recent: Movie[];
}

const WEEKDAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
const MONTH_NAMES = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];

function getCalendarDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  let startDow = firstDay.getDay();
  if (startDow === 0) startDow = 7; // Пн=1 ... Вс=7
  startDow -= 1; // 0-indexed

  const days: (number | null)[] = [];
  for (let i = 0; i < startDow; i++) days.push(null);
  for (let d = 1; d <= lastDay.getDate(); d++) days.push(d);
  while (days.length % 7 !== 0) days.push(null);
  return days;
}

// Цвета жанров для легенды
const GENRE_COLORS = ["#ffb84d", "#4CAF50", "#2196F3", "#E91E63", "#9C27B0", "#FF5722", "#00BCD4", "#8BC34A"];

export function CalendarClient({ upcoming, recent }: CalendarClientProps) {
  const [view, setView] = useState<"list" | "calendar">("list");
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const now = new Date();
  const [calMonth, setCalMonth] = useState(now.getMonth());
  const [calYear, setCalYear] = useState(now.getFullYear());

  // Все фильмы (upcoming + recent) по дате
  const moviesByDate = useMemo(() => {
    const map: Record<string, Movie[]> = {};
    [...upcoming, ...recent].forEach((m) => {
      if (m.releaseDate) {
        const d = new Date(m.releaseDate);
        const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
        if (!map[key]) map[key] = [];
        map[key].push(m);
      }
    });
    return map;
  }, [upcoming, recent]);

  // Группируем upcoming по месяцам
  const moviesByMonth: Record<string, Movie[]> = {};
  upcoming.forEach((movie) => {
    if (movie.releaseDate) {
      const d = new Date(movie.releaseDate);
      const monthKey = `${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()} г.`;
      if (!moviesByMonth[monthKey]) moviesByMonth[monthKey] = [];
      moviesByMonth[monthKey].push(movie);
    }
  });

  const formatDate = (date: Date) =>
    new Date(date).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" });

  const getDaysUntil = (date: Date) => {
    const diff = new Date(date).getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const allGenres = Array.from(
    new Map(
      [...upcoming, ...recent].flatMap((m) => m.genres.map((g) => g.genre)).map((g) => [g.slug, g])
    ).values()
  );

  const filteredUpcoming = selectedGenre
    ? upcoming.filter((m) => m.genres.some((g) => g.genre.slug === selectedGenre))
    : upcoming;

  const genreChips = [
    { slug: null, label: "Все" },
    ...allGenres.slice(0, 7).map((g) => ({ slug: g.slug, label: g.name })),
  ];

  const calendarDays = getCalendarDays(calYear, calMonth);
  const today = now.getDate();
  const isCurrentMonth = calYear === now.getFullYear() && calMonth === now.getMonth();

  const prevMonth = () => {
    if (calMonth === 0) { setCalMonth(11); setCalYear(calYear - 1); }
    else setCalMonth(calMonth - 1);
  };
  const nextMonth = () => {
    if (calMonth === 11) { setCalMonth(0); setCalYear(calYear + 1); }
    else setCalMonth(calMonth + 1);
  };

  // Ближайшие 4 премьеры
  const nextPremiers = upcoming
    .filter((m) => m.releaseDate && getDaysUntil(m.releaseDate) > 0)
    .sort((a, b) => new Date(a.releaseDate!).getTime() - new Date(b.releaseDate!).getTime())
    .slice(0, 4);

  // Статистика месяца
  const monthMovies = upcoming.filter((m) => {
    if (!m.releaseDate) return false;
    const d = new Date(m.releaseDate);
    return d.getMonth() === calMonth && d.getFullYear() === calYear;
  });

  return (
    <div className="min-h-screen bg-[#141414]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 sm:px-8 lg:px-12 pt-8 pb-2">
        <div>
          <h1 className="font-oswald text-4xl font-bold text-white">Календарь премьер</h1>
          <p className="font-mono text-[13px] text-white/45 mt-1">Следите за новинками кино</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setView("list")}
            className={`font-mono text-[13px] font-medium px-4 py-2 rounded-2xl transition-colors ${
              view === "list" ? "bg-[#ffb84d] text-white" : "bg-white/[0.08] text-white/45 hover:text-white"
            }`}
          >
            Список
          </button>
          <button
            onClick={() => setView("calendar")}
            className={`font-mono text-[13px] font-medium px-4 py-2 rounded-2xl transition-colors ${
              view === "calendar" ? "bg-[#ffb84d] text-white" : "bg-white/[0.08] text-white/45 hover:text-white"
            }`}
          >
            Календарь
          </button>
        </div>
      </div>

      {/* Genre Chips */}
      <div className="flex items-center gap-2.5 px-4 sm:px-8 lg:px-12 py-4 overflow-x-auto scrollbar-hide">
        {genreChips.map((chip) => (
          <button
            key={chip.slug || "all"}
            onClick={() => setSelectedGenre(chip.slug)}
            className={`font-mono text-[13px] px-4 py-2 rounded-2xl whitespace-nowrap transition-colors ${
              selectedGenre === chip.slug ? "bg-[#ffb84d] text-white" : "bg-white/[0.08] text-white/45 hover:text-white"
            }`}
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* ====================== VIEW: CALENDAR ====================== */}
      {view === "calendar" && (
        <div className="flex flex-col lg:flex-row gap-6 px-4 sm:px-8 lg:px-12 py-6 pb-12">
          {/* Calendar Grid */}
          <div className="flex-1 space-y-6">
            {/* Month Navigation */}
            <div className="flex items-center justify-between">
              <button onClick={prevMonth} className="w-9 h-9 bg-[#121821] rounded-[10px] border border-white/[0.08] flex items-center justify-center text-white/45 hover:text-white transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
              </button>
              <h2 className="font-oswald text-2xl font-bold text-white">{MONTH_NAMES[calMonth]} {calYear}</h2>
              <button onClick={nextMonth} className="w-9 h-9 bg-[#121821] rounded-[10px] border border-white/[0.08] flex items-center justify-center text-white/45 hover:text-white transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>

            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-0.5">
              {WEEKDAYS.map((d) => (
                <div key={d} className="bg-[#121821] rounded-t-lg h-9 flex items-center justify-center">
                  <span className="font-mono text-[11px] text-white/35 font-semibold">{d}</span>
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-0.5 -mt-5">
              {calendarDays.map((day, idx) => {
                const dateKey = day ? `${calYear}-${calMonth}-${day}` : "";
                const dayMovies = dateKey ? (moviesByDate[dateKey] || []) : [];
                const isToday = isCurrentMonth && day === today;

                return (
                  <div
                    key={idx}
                    className={`min-h-[100px] p-2 rounded-lg transition-colors ${
                      day === null ? "bg-transparent" :
                      isToday ? "bg-[#ffb84d]/10 border border-[#ffb84d]/50" :
                      "bg-[#121821] hover:bg-[#121821]"
                    }`}
                  >
                    {day !== null && (
                      <>
                        <span className={`font-mono text-[11px] font-bold ${
                          isToday ? "text-[#ffb84d]" : "text-white/35"
                        }`}>
                          {day}
                        </span>
                        {dayMovies.slice(0, 2).map((m) => (
                          <Link key={m.id} href={`/movies/${m.id}`} className="block mt-1">
                            <div className="flex items-center gap-1 bg-white/[0.08]/50 rounded px-1 py-0.5 hover:bg-[#ffb84d]/20 transition-colors">
                              {m.poster && (
                                <div className="relative w-4 h-5 flex-shrink-0 rounded overflow-hidden">
                                  {shouldUseUnoptimized(m.poster) ? <img src={getProxiedImageUrl(m.poster)!} alt="" className="absolute inset-0 w-full h-full object-cover" /> : <Image src={getProxiedImageUrl(m.poster)!} alt="" fill className="object-cover" sizes="16px" />}
                                </div>
                              )}
                              <span className="font-mono text-[9px] text-white line-clamp-1">{m.title}</span>
                            </div>
                          </Link>
                        ))}
                        {dayMovies.length > 2 && (
                          <span className="font-mono text-[9px] text-[#ffb84d] mt-0.5 block">+{dayMovies.length - 2} ещё</span>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-[300px] flex-shrink-0 space-y-6">
            {/* Today Card */}
            <div className="bg-[#121821] rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="inline-block h-2 w-2 rounded-full bg-[#ffb84d]" aria-hidden />
                <span className="font-oswald text-base font-semibold text-white">Сегодня</span>
              </div>
              <div className="text-center py-4">
                <p className="font-oswald text-5xl font-bold text-[#ffb84d]">{now.getDate()}</p>
                <p className="font-mono text-[12px] text-white/45 mt-1">
                  {now.toLocaleDateString("ru-RU", { month: "long", weekday: "long" })}
                </p>
              </div>
            </div>

            {/* Upcoming Premieres */}
            <div className="bg-[#121821] rounded-2xl p-5">
              <h3 className="font-oswald text-lg font-semibold text-white mb-4">Ближайшие премьеры</h3>
              <div className="space-y-3">
                {nextPremiers.map((m) => (
                  <Link key={m.id} href={`/movies/${m.id}`} className="flex items-center gap-3 group">
                    <div className="w-8 h-8 bg-[#ffb84d] rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="font-oswald text-[12px] font-bold text-[#111]">
                        {m.releaseDate ? new Date(m.releaseDate).getDate() : "?"}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-mono text-[12px] text-white group-hover:text-[#ffb84d] transition-colors line-clamp-1">{m.title}</p>
                      <p className="font-mono text-[10px] text-white/35">
                        {m.genres[0]?.genre.name} • {m.releaseDate ? getDaysUntil(m.releaseDate) : 0} дн.
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Genre Legend */}
            <div className="bg-[#121821] rounded-2xl p-5">
              <h3 className="font-oswald text-lg font-semibold text-white mb-4">Жанры</h3>
              <div className="space-y-2.5">
                {allGenres.slice(0, 5).map((g, i) => (
                  <div key={g.slug} className="flex items-center gap-2.5">
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: GENRE_COLORS[i % GENRE_COLORS.length] }} />
                    <span className="font-mono text-[12px] text-white/45">{g.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Month Stats */}
            <div className="bg-[#121821] rounded-2xl p-5">
              <h3 className="font-oswald text-lg font-semibold text-white mb-4">Статистика месяца</h3>
              <div className="flex gap-3">
                <div className="flex-1 text-center bg-[#121821] rounded-xl p-3">
                  <p className="font-oswald text-2xl font-bold text-[#ffb84d]">{monthMovies.length}</p>
                  <p className="font-mono text-[10px] text-white/35">Премьер</p>
                </div>
                <div className="flex-1 text-center bg-[#121821] rounded-xl p-3">
                  <p className="font-oswald text-2xl font-bold text-[#4CAF50]">{new Set(monthMovies.flatMap((m) => m.genres.map((g) => g.genre.slug))).size}</p>
                  <p className="font-mono text-[10px] text-white/35">Жанров</p>
                </div>
                <div className="flex-1 text-center bg-[#121821] rounded-xl p-3">
                  <p className="font-oswald text-2xl font-bold text-[#2196F3]">{new Set(monthMovies.filter((m) => m.director).map((m) => m.director!.name)).size}</p>
                  <p className="font-mono text-[10px] text-white/35">Реж.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ====================== VIEW: LIST ====================== */}
      {view === "list" && (
        <>
          {/* Featured */}
          {filteredUpcoming.length > 0 && (
            <div className="px-4 sm:px-8 lg:px-12 py-4">
              <h2 className="font-oswald text-xl font-semibold text-white mb-4">Скоро в кино</h2>
              <div className="grid md:grid-cols-3 gap-4">
                {filteredUpcoming.slice(0, 3).map((movie) => {
                  const daysUntil = movie.releaseDate ? getDaysUntil(movie.releaseDate) : null;
                  return (
                    <Link key={movie.id} href={`/movies/${movie.id}`}>
                      <div className="group relative h-[200px] rounded-2xl overflow-hidden bg-[#121821]">
                        {movie.backdrop || movie.poster ? (() => {
                          const url = getProxiedImageUrl(movie.backdrop || movie.poster!);
                          return shouldUseUnoptimized(url)
                            ? <img src={url!} alt={movie.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                            : <Image src={url!} alt={movie.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width: 768px) 100vw, 33vw" />;
                        })() : (
                          <div className="w-full h-full bg-gradient-to-br from-[#121821] to-[#141414]" />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                        {daysUntil !== null && daysUntil > 0 && (
                          <div className="absolute top-3 right-3 bg-red-600 text-white font-mono text-[10px] font-bold px-2.5 py-1 rounded-lg">
                            Через {daysUntil} дн.
                          </div>
                        )}
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                          <div className="flex gap-1.5 mb-2">
                            {movie.genres.slice(0, 2).map((mg) => (
                              <span key={mg.genre.slug} className="font-mono text-[10px] text-[#ffb84d] bg-[#ffb84d]/20 px-2 py-0.5 rounded">{mg.genre.name}</span>
                            ))}
                          </div>
                          <h3 className="font-oswald text-lg font-bold text-white group-hover:text-[#ffb84d] transition-colors">{movie.title}</h3>
                          {movie.releaseDate && <p className="font-mono text-[11px] text-[#ffb84d] mt-1">{formatDate(movie.releaseDate)}</p>}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* List + Mini-calendar sidebar */}
          <div className="flex flex-col lg:flex-row gap-6 px-4 sm:px-8 lg:px-12 py-6 pb-12">
            {/* Left: list by month */}
            <div className="flex-1">
              <h2 className="font-oswald text-xl font-semibold text-white mb-2">Предстоящие премьеры</h2>
              {Object.keys(moviesByMonth).length === 0 ? (
                <div className="text-center py-12 bg-[#121821] rounded-2xl">
                  <p className="font-mono text-[13px] text-white/35">Нет информации о предстоящих премьерах</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {Object.entries(moviesByMonth).map(([month, movies]) => (
                    <div key={month}>
                      <p className="font-mono text-[12px] font-semibold text-[#ffb84d] mb-2 uppercase">{month}</p>
                      <div className="space-y-0.5">
                        {movies.map((movie) => (
                          <Link key={movie.id} href={`/movies/${movie.id}`} className="flex items-center gap-4 p-3 px-4 bg-[#121821] rounded-2xl hover:ring-1 hover:ring-[#ffb84d]/30 transition-all group">
                            <div className="flex-shrink-0 w-10 text-center">
                              <span className="font-oswald text-lg font-bold text-[#ffb84d]">
                                {movie.releaseDate ? new Date(movie.releaseDate).getDate() : "?"}
                              </span>
                            </div>
                            <div className="relative w-8 h-11 flex-shrink-0 rounded overflow-hidden bg-white/[0.08]">
                              {movie.poster ? (shouldUseUnoptimized(movie.poster) ? <img src={getProxiedImageUrl(movie.poster)!} alt="" className="absolute inset-0 w-full h-full object-cover" /> : <Image src={getProxiedImageUrl(movie.poster)!} alt="" fill className="object-cover" sizes="32px" />) : <div className="w-full h-full flex items-center justify-center text-[10px] text-white/40">КТ</div>}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-mono text-[13px] font-semibold text-white group-hover:text-[#ffb84d] transition-colors">{movie.title}</h4>
                              <div className="flex items-center gap-2 font-mono text-[11px] text-white/35">
                                {movie.genres.slice(0, 2).map((g) => g.genre.name).join(", ")}
                                {movie.director && <span>• {movie.director.name}</span>}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {movie.genres[0] && (
                                <span className="font-mono text-[10px] text-white/45 bg-white/[0.08] px-2 py-0.5 rounded">{movie.genres[0].genre.name}</span>
                              )}
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right sidebar: mini calendar + events */}
            <div className="w-[320px] flex-shrink-0 space-y-4">
              {/* Mini calendar */}
              <div className="bg-[#121821] rounded-2xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-oswald text-base font-semibold text-white">{MONTH_NAMES[calMonth]} {calYear}</span>
                  <div className="flex gap-2">
                    <button onClick={prevMonth} className="text-white/35 hover:text-white transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <button onClick={nextMonth} className="text-white/35 hover:text-white transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-7 gap-1 mb-1">
                  {WEEKDAYS.map((d) => (
                    <div key={d} className="text-center"><span className="font-mono text-[9px] text-white/35">{d}</span></div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {calendarDays.map((day, idx) => {
                    const dateKey = day ? `${calYear}-${calMonth}-${day}` : "";
                    const hasMovies = dateKey ? (moviesByDate[dateKey]?.length || 0) > 0 : false;
                    const isToday2 = isCurrentMonth && day === today;
                    return (
                      <div key={idx} className={`w-full aspect-square flex items-center justify-center rounded ${
                        day === null ? "" :
                        isToday2 ? "bg-[#ffb84d] text-[#111]" :
                        hasMovies ? "bg-[#ffb84d]/20 text-[#ffb84d]" : "text-white/35 hover:bg-white/[0.08]"
                      } transition-colors`}>
                        {day !== null && <span className="font-mono text-[10px] font-semibold">{day}</span>}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Upcoming events */}
              <div>
                <h3 className="font-oswald text-base font-semibold text-white mb-3">Ближайшие события</h3>
                <div className="bg-[#121821] rounded-2xl p-4 space-y-3">
                  {nextPremiers.slice(0, 3).map((m) => (
                    <Link key={m.id} href={`/movies/${m.id}`} className="flex items-center gap-3 group">
                      <div className="w-7 h-7 bg-[#ffb84d] rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="font-oswald text-[11px] font-bold text-[#111]">
                          {m.releaseDate ? new Date(m.releaseDate).getDate() : "?"}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-mono text-[12px] text-white group-hover:text-[#ffb84d] transition-colors line-clamp-1">{m.title}</p>
                        <p className="font-mono text-[10px] text-white/35">{m.genres[0]?.genre.name}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
