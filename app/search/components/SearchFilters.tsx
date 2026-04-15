"use client";

interface Genre {
  id: string;
  name: string;
  slug: string;
}

interface SearchFiltersProps {
  genres: Genre[];
  years: number[];
  countries: string[];
  selectedGenres: string[];
  selectedYear: string;
  selectedCountry: string;
  minRating: number;
  showFilters: boolean;
  onToggleFilters: () => void;
  onToggleGenre: (slug: string) => void;
  onYearChange: (year: string) => void;
  onCountryChange: (country: string) => void;
  onMinRatingChange: (rating: number) => void;
  onClearFilters: () => void;
}

export function SearchFilters({
  genres,
  years,
  countries,
  selectedGenres,
  selectedYear,
  selectedCountry,
  minRating,
  showFilters,
  onToggleFilters,
  onToggleGenre,
  onYearChange,
  onCountryChange,
  onMinRatingChange,
  onClearFilters,
}: SearchFiltersProps) {
  const hasFilters = selectedGenres.length > 0 || selectedYear || selectedCountry || minRating > 0;

  return (
    <div className="max-w-3xl mx-auto mb-8">
      <button
        onClick={onToggleFilters}
        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
        </svg>
        Расширенные фильтры
        {hasFilters && (
          <span className="w-2 h-2 bg-amber-500 rounded-full" />
        )}
      </button>

      {showFilters && (
        <div className="mt-4 p-6 bg-slate-800/50 rounded-xl border border-slate-700/50 space-y-4">
          <div>
            <label className="block text-white text-sm font-medium mb-2">Жанры</label>
            <div className="flex flex-wrap gap-2">
              {genres.map((genre) => (
                <button
                  key={genre.id}
                  onClick={() => onToggleGenre(genre.slug)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    selectedGenres.includes(genre.slug)
                      ? "bg-amber-500 text-black"
                      : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                  }`}
                >
                  {genre.name}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-white text-sm font-medium mb-2">Год</label>
              <select
                value={selectedYear}
                onChange={(e) => onYearChange(e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
              >
                <option value="">Любой</option>
                {years.map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-white text-sm font-medium mb-2">Страна</label>
              <select
                value={selectedCountry}
                onChange={(e) => onCountryChange(e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
              >
                <option value="">Любая</option>
                {countries.map((country) => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-white text-sm font-medium mb-2">Мин. рейтинг</label>
              <select
                value={minRating}
                onChange={(e) => onMinRatingChange(parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
              >
                <option value={0}>Любой</option>
                {[5, 6, 7, 8, 9].map((r) => (
                  <option key={r} value={r}>{r}+</option>
                ))}
              </select>
            </div>
          </div>

          {hasFilters && (
            <button
              onClick={onClearFilters}
              className="text-amber-400 hover:text-amber-300 text-sm"
            >
              Сбросить фильтры
            </button>
          )}
        </div>
      )}
    </div>
  );
}

