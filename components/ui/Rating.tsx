"use client";

import { useState } from "react";

interface RatingProps {
  value: number;
  onChange?: (value: number) => void;
  readonly?: boolean;
  size?: "sm" | "md" | "lg";
  showValue?: boolean;
}

export function Rating({
  value,
  onChange,
  readonly = false,
  size = "md",
  showValue = false,
}: RatingProps) {
  const [hoverValue, setHoverValue] = useState(0);

  const sizes = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  const displayValue = hoverValue || value;

  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
          <button
            key={star}
            type="button"
            disabled={readonly}
            onClick={() => onChange?.(star)}
            onMouseEnter={() => !readonly && setHoverValue(star)}
            onMouseLeave={() => setHoverValue(0)}
            className={`${readonly ? "cursor-default" : "cursor-pointer"} transition-colors`}
          >
            <svg
              className={`${sizes[size]} ${
                star <= displayValue ? "text-amber-400" : "text-slate-600"
              } transition-colors`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </button>
        ))}
      </div>
      {showValue && (
        <span className="text-amber-400 font-semibold">{value}/10</span>
      )}
    </div>
  );
}

export function RatingDisplay({ value, size = "sm" }: { value: number; size?: "xs" | "sm" | "md" | "lg" }) {
  const getColor = () => {
    if (value >= 8) return "text-green-400";
    if (value >= 6) return "text-amber-400";
    if (value >= 4) return "text-orange-400";
    return "text-red-400";
  };

  const sizes = {
    xs: "text-[10px]",
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  const iconSizes = {
    xs: "w-2.5 h-2.5",
    sm: "w-3 h-3",
    md: "w-3.5 h-3.5",
    lg: "w-4 h-4",
  };

  // Компактный вариант для карточек (xs размер)
  if (size === "xs") {
    return (
      <div className={`inline-flex items-center gap-0.5 ${getColor()} bg-black/60 backdrop-blur-sm rounded px-1.5 py-0.5`}>
        <svg className={iconSizes[size]} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
        <span className={`${sizes[size]} font-semibold leading-none`}>{value.toFixed(1)}</span>
      </div>
    );
  }

  // Обычный вариант для других размеров
  return (
    <span className={`inline-flex items-center rounded-lg font-bold border ${getColor()} bg-${getColor().split('-')[1]}-500/20 border-${getColor().split('-')[1]}-500/30 ${size === "sm" ? "text-sm px-2 py-0.5" : size === "md" ? "text-base px-3 py-1" : "text-lg px-4 py-1.5"}`}>
      <svg className={`${iconSizes[size]} mr-0.5`} fill="currentColor" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
      {value.toFixed(1)}
    </span>
  );
}

