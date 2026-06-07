"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { SearchBar } from "./components/SearchBar";
import { SearchFilters } from "./components/SearchFilters";
import { SearchResults } from "./components/SearchResults";
import { useSpeechRecognition } from "./hooks/useSpeechRecognition";

interface Genre {
  id: string;
  name: string;
  slug: string;
}

interface SearchResult {
  id: string;
  type: "movie" | "actor" | "director";
  title: string;
  subtitle?: string;
  image?: string;
  year?: number;
  genres?: string[];
  rating?: number;
}

interface SearchClientProps {
  genres: Genre[];
  years: number[];
  countries: string[];
}

export function SearchClient({ genres, years, countries }: SearchClientProps) {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchType, setSearchType] = useState<"all" | "movies" | "actors" | "directors">("all");
  
  const [showFilters, setShowFilters] = useState(false);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [minRating, setMinRating] = useState<number>(0);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const urlQuerySeeded = useRef(false);

  useEffect(() => {
    const q = searchParams.get("q");
    if (urlQuerySeeded.current || !q?.trim()) return;
    urlQuerySeeded.current = true;
    setQuery(q);
  }, [searchParams]);

  const performSearch = useCallback(async (searchQuery: string = query) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);

    try {
      const params = new URLSearchParams();
      params.set("q", searchQuery);
      params.set("type", searchType);
      if (selectedGenres.length) params.set("genres", selectedGenres.join(","));
      if (selectedYear) params.set("year", selectedYear);
      if (selectedCountry) params.set("country", selectedCountry);
      if (minRating) params.set("minRating", minRating.toString());

      const res = await fetch(`/api/search?${params.toString()}`);
      const data = await res.json();

      setResults(data.results || []);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsLoading(false);
    }
  }, [query, searchType, selectedGenres, selectedYear, selectedCountry, minRating]);

  // Поиск в реальном времени при вводе (с debounce)
  useEffect(() => {
    // Очищаем предыдущий таймер
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Если запрос пустой, очищаем результаты
    if (!query.trim()) {
      setResults([]);
      return;
    }

    // Устанавливаем новый таймер для поиска через 300ms после остановки ввода
    searchTimeoutRef.current = setTimeout(() => {
      performSearch(query);
    }, 300);

    // Очистка при размонтировании
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [query, performSearch]);

  const { isListening, startListening, stopListening, hasSpeechRecognition } = useSpeechRecognition(
    (transcript) => {
      setQuery(transcript);
      performSearch(transcript);
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch();
  };

  const toggleGenre = (slug: string) => {
    setSelectedGenres((prev) =>
      prev.includes(slug) ? prev.filter((g) => g !== slug) : [...prev, slug]
    );
  };

  const clearFilters = () => {
    setSelectedGenres([]);
    setSelectedYear("");
    setSelectedCountry("");
    setMinRating(0);
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="mb-2 text-4xl font-bold text-white">Поиск</h1>
          <p className="text-slate-400">Найдите фильмы, актёров и режиссёров</p>
        </div>

        <SearchBar
          query={query}
          isListening={isListening}
          isLoading={isLoading}
          onQueryChange={setQuery}
          onSubmit={handleSubmit}
          onStartListening={startListening}
          onStopListening={stopListening}
          hasSpeechRecognition={hasSpeechRecognition}
        />

        <div className="max-w-3xl mx-auto mb-6">
          <div className="flex justify-center gap-2">
            {[
              { id: "all", label: "Все" },
              { id: "movies", label: "Фильмы" },
              { id: "actors", label: "Актёры" },
              { id: "directors", label: "Режиссёры" },
            ].map((type) => (
              <button
                key={type.id}
                onClick={() => setSearchType(type.id as typeof searchType)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  searchType === type.id
                    ? "bg-amber-500 text-black"
                    : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {searchType === "movies" && (
          <SearchFilters
            genres={genres}
            years={years}
            countries={countries}
            selectedGenres={selectedGenres}
            selectedYear={selectedYear}
            selectedCountry={selectedCountry}
            minRating={minRating}
            showFilters={showFilters}
            onToggleFilters={() => setShowFilters(!showFilters)}
            onToggleGenre={toggleGenre}
            onYearChange={setSelectedYear}
            onCountryChange={setSelectedCountry}
            onMinRatingChange={setMinRating}
            onClearFilters={clearFilters}
          />
        )}

        <SearchResults results={results} />

        {query && !isLoading && results.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-lg text-slate-400">Ничего не найдено</p>
            <p className="mt-2 text-sm text-slate-500">Попробуйте изменить запрос</p>
          </div>
        )}

        {!query && (
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-slate-500 mb-4">Или попробуйте:</p>
            <div className="flex flex-wrap justify-center gap-2">
              {["Интерстеллар", "Тарантино", "Комедия 2024", "Ди Каприо", "Нолан"].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => {
                    setQuery(suggestion);
                    performSearch(suggestion);
                  }}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-full text-slate-300 hover:text-white transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
