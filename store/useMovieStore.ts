import { create } from "zustand";

interface MovieFilters {
  search: string;
  genre: string;
  year: string;
  country: string;
  sortBy: "popularity" | "releaseDate" | "rating" | "title";
  sortOrder: "asc" | "desc";
}

interface MovieStore {
  filters: MovieFilters;
  setFilter: <K extends keyof MovieFilters>(key: K, value: MovieFilters[K]) => void;
  resetFilters: () => void;
}

const defaultFilters: MovieFilters = {
  search: "",
  genre: "",
  year: "",
  country: "",
  sortBy: "popularity",
  sortOrder: "desc",
};

export const useMovieStore = create<MovieStore>((set) => ({
  filters: defaultFilters,
  setFilter: (key, value) =>
    set((state) => ({
      filters: { ...state.filters, [key]: value },
    })),
  resetFilters: () => set({ filters: defaultFilters }),
}));

