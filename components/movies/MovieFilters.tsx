"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";

interface Genre {
  id: string;
  name: string;
  slug: string;
}

interface MovieFiltersProps {
  genres: Genre[];
}

export function MovieFilters({ genres }: MovieFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [selectedGenre, setSelectedGenre] = useState(searchParams.get("genre") || "");
  const [selectedYear, setSelectedYear] = useState(searchParams.get("year") || "");
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "popularity");

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 50 }, (_, i) => currentYear - i);

  const applyFilters = (patch?: {
    search?: string;
    genre?: string;
    year?: string;
    sort?: string;
  }) => {
    const q = patch?.search ?? search;
    const genre = patch?.genre ?? selectedGenre;
    const year = patch?.year ?? selectedYear;
    const sort = patch?.sort ?? sortBy;

    const params = new URLSearchParams();

    if (q.trim()) params.set("q", q.trim());
    if (genre) params.set("genre", genre);
    if (year) params.set("year", year);
    if (sort && sort !== "popularity") params.set("sort", sort);

    startTransition(() => {
      const qs = params.toString();
      router.push(qs ? `/movies?${qs}` : "/movies");
    });
  };

  const resetFilters = () => {
    setSearch("");
    setSelectedGenre("");
    setSelectedYear("");
    setSortBy("popularity");
    
    startTransition(() => {
      router.push("/movies");
    });
  };

  const hasActiveFilters = search || selectedGenre || selectedYear || sortBy !== "popularity";

  return (
    <div className="flex items-center gap-4 flex-wrap">
      {/* Search Input */}
      <div className="flex-1 min-w-[200px] relative">
        <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5A6478]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Поиск по названию..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && applyFilters()}
          className="w-full h-11 bg-[#1A2236] rounded-2xl pl-10 pr-4 font-mono text-[13px] text-white placeholder-[#5A6478] border-none outline-none focus:ring-1 focus:ring-[#FF8400]/50 transition-all"
        />
      </div>

      {/* Genre Filter */}
      <div className="relative">
        <select
          value={selectedGenre}
          onChange={(e) => {
            const genre = e.target.value;
            setSelectedGenre(genre);
            applyFilters({ genre });
          }}
          className="h-11 bg-[#1A2236] rounded-2xl px-4 pr-10 font-mono text-[13px] text-[#8B95A8] border-none outline-none appearance-none cursor-pointer focus:ring-1 focus:ring-[#FF8400]/50"
        >
          <option value="">Все жанры</option>
          {genres.map((g) => (
            <option key={g.id} value={g.slug}>{g.name}</option>
          ))}
        </select>
        <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5A6478] pointer-events-none" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {/* Year Filter */}
      <div className="relative">
        <select
          value={selectedYear}
          onChange={(e) => {
            const year = e.target.value;
            setSelectedYear(year);
            applyFilters({ year });
          }}
          className="h-11 bg-[#1A2236] rounded-2xl px-4 pr-10 font-mono text-[13px] text-[#8B95A8] border-none outline-none appearance-none cursor-pointer focus:ring-1 focus:ring-[#FF8400]/50"
        >
          <option value="">Год выхода</option>
          {years.map((y) => (
            <option key={y} value={y.toString()}>{y}</option>
          ))}
        </select>
        <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5A6478] pointer-events-none" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {/* Sort Filter */}
      <div className="relative">
        <select
          value={sortBy}
          onChange={(e) => {
            const sort = e.target.value;
            setSortBy(sort);
            applyFilters({ sort });
          }}
          className="h-11 bg-[#1A2236] rounded-2xl px-4 pr-10 font-mono text-[13px] text-[#8B95A8] border-none outline-none appearance-none cursor-pointer focus:ring-1 focus:ring-[#FF8400]/50"
        >
          <option value="popularity">По популярности</option>
          <option value="rating">По рейтингу</option>
          <option value="releaseDate">По дате выхода</option>
          <option value="title">По названию</option>
        </select>
        <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5A6478] pointer-events-none" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {/* Apply Button */}
      <button
        onClick={() => applyFilters()}
        disabled={isPending}
        className="h-11 bg-[#FF8400] hover:bg-[#FF9F2E] text-white font-mono text-[13px] font-semibold px-6 rounded-2xl transition-colors disabled:opacity-50"
      >
        {isPending ? "..." : "Применить"}
      </button>

      {/* Reset */}
      {hasActiveFilters && (
        <button
          onClick={resetFilters}
          className="h-11 font-mono text-[13px] text-[#8B95A8] hover:text-white transition-colors"
        >
          Сбросить
        </button>
      )}
    </div>
  );
}
