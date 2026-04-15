"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/Button";

interface SearchBarProps {
  query: string;
  isListening: boolean;
  isLoading: boolean;
  onQueryChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onStartListening: () => void;
  onStopListening: () => void;
  hasSpeechRecognition: boolean;
}

export function SearchBar({
  query,
  isListening,
  isLoading,
  onQueryChange,
  onSubmit,
  onStartListening,
  onStopListening,
  hasSpeechRecognition,
}: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="max-w-3xl mx-auto mb-8">
      <form onSubmit={onSubmit} className="relative">
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Введите название фильма, имя актёра или режиссёра..."
            className="w-full px-6 py-4 pl-14 pr-32 bg-slate-800 border border-slate-700 rounded-2xl text-white text-lg placeholder:text-slate-500 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
          />
          
          <div className="absolute left-4 top-1/2 -translate-y-1/2">
            <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
            {hasSpeechRecognition && (
              <button
                type="button"
                onClick={isListening ? onStopListening : onStartListening}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                  isListening
                    ? "bg-red-500 animate-pulse"
                    : "bg-slate-700 hover:bg-slate-600"
                }`}
              >
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </button>
            )}
            
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "..." : "Найти"}
            </Button>
          </div>
        </div>
      </form>

      {isListening && (
        <div className="mt-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/20 rounded-full">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
            <span className="text-red-400">Слушаю...</span>
          </div>
        </div>
      )}
    </div>
  );
}

