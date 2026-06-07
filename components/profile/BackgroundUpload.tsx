"use client";

import { useState, useRef } from "react";
import { getBackgroundStyle } from "@/lib/customization";

interface BackgroundUploadProps {
  currentBackground: string | null;
  onBackgroundChange?: (background: string | null) => void;
}

export function BackgroundUpload({
  currentBackground,
  onBackgroundChange,
}: BackgroundUploadProps) {
  const [background, setBackground] = useState<string | null>(currentBackground);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Проверка типа файла
    if (!file.type.startsWith("image/")) {
      setError("Выберите изображение");
      return;
    }

    // Проверка размера (макс 6MB для фона)
    if (file.size > 6 * 1024 * 1024) {
      setError("Размер файла не должен превышать 6MB");
      return;
    }

    setError("");
    setIsUploading(true);

    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const base64String = reader.result as string;

        const res = await fetch("/api/user/background", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ background: base64String }),
        });

        const contentType = res.headers.get("content-type");
        if (!res.ok) {
          if (contentType && contentType.includes("application/json")) {
            const data = await res.json();
            setError(data.error || "Ошибка при загрузке");
          } else {
            setError("Ошибка при загрузке");
          }
        } else {
          if (contentType && contentType.includes("application/json")) {
            const data = await res.json();
            setBackground(data.background);
            onBackgroundChange?.(data.background);
            window.dispatchEvent(new CustomEvent("backgroundUpdated", { detail: { background: data.background } }));
            setError("");
          }
        }
      } catch {
        setError("Ошибка при загрузке фона");
      } finally {
        setIsUploading(false);
      }
    };

    reader.onerror = () => {
      setError("Ошибка при чтении файла");
      setIsUploading(false);
    };

    reader.readAsDataURL(file);
  };

  const handleDelete = async () => {
    setIsUploading(true);
    setError("");

    try {
      const res = await fetch("/api/user/background", {
        method: "DELETE",
      });

      if (!res.ok) {
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const data = await res.json();
          setError(data.error || "Ошибка при удалении");
        } else {
          setError("Ошибка при удалении");
        }
      } else {
        setBackground(null);
        onBackgroundChange?.(null);
        // Уведомляем о необходимости обновить фон
        window.dispatchEvent(new CustomEvent("backgroundUpdated", { detail: { background: null } }));
      }
    } catch {
      setError("Ошибка при удалении фона");
    } finally {
      setIsUploading(false);
    }
  };

  const backgroundStyle = getBackgroundStyle(background);

  return (
    <div className="relative">
      {/* Preview */}
      <div className="relative h-48 rounded-xl overflow-hidden border-2 border-white/[0.12] bg-gradient-to-b from-[#121821] to-[#0b0f14]">
        <div
          className="absolute inset-0"
          style={backgroundStyle}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0b0f14]/50 to-[#0b0f14]/80" />
        
        {/* Overlay with buttons */}
        <div className="absolute inset-0 flex items-center justify-center gap-3 opacity-0 hover:opacity-100 transition-opacity bg-black/20">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="px-4 py-2 bg-[#ffb84d] hover:bg-[#ffc56a] text-white font-mono text-[13px] font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            title="Изменить фон"
          >
            {isUploading ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Загрузка...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Изменить фон
              </>
            )}
          </button>
          
          {background && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={isUploading}
              className="px-4 py-2 bg-red-500/90 hover:bg-red-600/90 text-white font-mono text-[13px] font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              title="Удалить фон"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
              Удалить
            </button>
          )}
        </div>

        {/* Info text when no background */}
        {!background && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="font-mono text-[13px] text-white/45 text-center px-4">
              Наведите курсор для загрузки фона
            </p>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {error && (
        <p className="mt-2 text-sm text-red-400">{error}</p>
      )}
      
      <p className="mt-2 font-mono text-[11px] text-white/35">
        Рекомендуемый размер: 1920x340 пикселей. Максимальный размер файла: 6MB.
      </p>
    </div>
  );
}
