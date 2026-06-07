"use client";

import { useState, useRef } from "react";
import { getFrameClasses, getAvatarEffectClasses } from "@/lib/customization";

interface AvatarUploadProps {
  currentAvatar: string | null;
  userName: string | null;
  userEmail: string;
  profileFrame?: string | null;
  avatarEffect?: string | null;
  onAvatarChange?: (avatar: string | null) => void;
}

export function AvatarUpload({
  currentAvatar,
  userName,
  userEmail,
  profileFrame,
  avatarEffect,
  onAvatarChange,
}: AvatarUploadProps) {
  const [avatar, setAvatar] = useState<string | null>(currentAvatar);
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

    // Проверка размера (макс 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError("Размер файла не должен превышать 2MB");
      return;
    }

    setError("");
    setIsUploading(true);

    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const base64String = reader.result as string;

        const res = await fetch("/api/user/avatar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ avatar: base64String }),
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
            setAvatar(data.avatar);
            onAvatarChange?.(data.avatar);
            window.dispatchEvent(new CustomEvent("avatarUpdated", { detail: { avatar: data.avatar } }));
            setError("");
          }
        }
      } catch {
        setError("Ошибка при загрузке аватара");
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
      const res = await fetch("/api/user/avatar", {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Ошибка при удалении");
      } else {
        setAvatar(null);
        onAvatarChange?.(null);
        // Уведомляем Header о необходимости обновить аватар
        window.dispatchEvent(new CustomEvent("avatarUpdated", { detail: { avatar: null } }));
      }
    } catch {
      setError("Ошибка при удалении аватара");
    } finally {
      setIsUploading(false);
    }
  };

  const frameClasses = getFrameClasses(profileFrame);
  const effectClasses = getAvatarEffectClasses(avatarEffect);

  return (
    <div className="relative">
      <div className={`relative inline-block rounded-full ${frameClasses} ${effectClasses}`}>
        {avatar ? (
          <div className="w-24 h-24 rounded-full overflow-hidden flex-shrink-0 relative">
            <img
              src={avatar}
              alt={userName || ""}
              className="w-full h-full object-cover"
              style={{ objectPosition: "center", borderRadius: "50%" }}
            />
            {/* Крестик для удаления - всегда виден когда есть аватар */}
            <button
              type="button"
              onClick={handleDelete}
              disabled={isUploading}
              className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500/90 hover:bg-red-600/90 rounded-full flex items-center justify-center text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed z-30 border border-white/30 shadow-md"
              aria-label="Удалить аватар"
            >
              {isUploading ? (
                <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : (
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        ) : (
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white font-bold text-3xl flex-shrink-0">
            {userName?.[0] || userEmail[0].toUpperCase()}
          </div>
        )}

        {/* Кнопка загрузки */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="absolute bottom-0 right-0 w-9 h-9 bg-[#ffb84d] hover:bg-[#ffc56a] rounded-full flex items-center justify-center text-white shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed border-2 border-white/20 z-20"
          title="Изменить аватар"
        >
          {isUploading ? (
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          )}
        </button>
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
    </div>
  );
}
