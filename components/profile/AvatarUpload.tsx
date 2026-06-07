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

  // Crop modal states
  const [showCropModal, setShowCropModal] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const imgRef = useRef<HTMLImageElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Выберите изображение");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Размер файла не должен превышать 5MB");
      return;
    }

    setError("");
    const reader = new FileReader();
    reader.onload = () => {
      setImageSrc(reader.result as string);
      setShowCropModal(true);
      setZoom(1);
      setPosition({ x: 0, y: 0 });
    };
    reader.readAsDataURL(file);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    const touch = e.touches[0];
    setIsDragging(true);
    setDragStart({ x: touch.clientX - position.x, y: touch.clientY - position.y });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    const touch = e.touches[0];
    setPosition({
      x: touch.clientX - dragStart.x,
      y: touch.clientY - dragStart.y,
    });
  };

  const handleCropSave = async () => {
    if (!imgRef.current) return;
    setIsUploading(true);
    setShowCropModal(false);

    try {
      const img = imgRef.current;
      const canvas = document.createElement("canvas");
      canvas.width = 256;
      canvas.height = 256;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Could not get canvas context");

      // Container size is 300x300. Crop circle has diameter 240, centered (margins = 30px)
      const renderWidth = img.naturalWidth || img.clientWidth || 300;
      const renderHeight = img.naturalHeight || img.clientHeight || 300;

      // Fit calculations
      const scaleX = 300 / renderWidth;
      const scaleY = 300 / renderHeight;
      const baseScale = Math.min(scaleX, scaleY);
      
      const w = renderWidth * baseScale * zoom;
      const h = renderHeight * baseScale * zoom;

      const imgLeft = (300 - w) / 2 + position.x;
      const imgTop = (300 - h) / 2 + position.y;

      const drawScale = 256 / 240;
      const dx = (imgLeft - 30) * drawScale;
      const dy = (imgTop - 30) * drawScale;
      const dw = w * drawScale;
      const dh = h * drawScale;

      ctx.drawImage(img, dx, dy, dw, dh);

      const base64String = canvas.toDataURL("image/jpeg", 0.9);

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
      setError("Ошибка при обрезке аватара");
    } finally {
      setIsUploading(false);
      setImageSrc(null);
    }
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
    <div className="relative flex flex-col items-center justify-center">
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

      {/* Crop Modal Popup */}
      {showCropModal && imageSrc && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-sm rounded-2xl border border-white/[0.08] bg-[#1a1a1a] p-6 shadow-2xl animate-zoom-in-95">
            <h3 className="text-lg font-bold text-white mb-4 text-center font-oswald">
              Подгонка фотографии
            </h3>
            
            {/* Drag Container */}
            <div
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleMouseUp}
              className="relative w-[300px] h-[300px] mx-auto overflow-hidden rounded-xl bg-black/60 border border-white/[0.08] cursor-move select-none"
            >
              {/* Image to crop */}
              <img
                ref={imgRef}
                src={imageSrc}
                alt="Source"
                className="absolute max-w-none pointer-events-none transition-transform duration-75 origin-center"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
                }}
              />
              
              {/* Circular Cutout Mask */}
              <div 
                className="absolute inset-0 rounded-full border-2 border-white pointer-events-none m-[30px] shadow-[0_0_0_9999px_rgba(0,0,0,0.65)]"
                aria-hidden="true"
              />
            </div>

            {/* Zoom Slider */}
            <div className="mt-6">
              <div className="flex justify-between text-xs text-white/50 mb-1.5 font-mono">
                <span>Масштаб</span>
                <span>{Math.round(zoom * 100)}%</span>
              </div>
              <input
                type="range"
                min="1"
                max="4"
                step="0.05"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="w-full accent-[#ffb84d] bg-white/10 h-1 rounded-lg cursor-pointer"
              />
            </div>

            {/* Actions */}
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowCropModal(false);
                  setImageSrc(null);
                }}
                className="flex-1 rounded-xl border border-white/10 bg-white/[0.05] hover:bg-white/[0.08] text-white py-2.5 font-mono text-[13px] font-medium transition-colors"
              >
                Отмена
              </button>
              <button
                type="button"
                onClick={handleCropSave}
                className="flex-1 rounded-xl bg-[#ffb84d] hover:bg-[#ffc56a] text-black py-2.5 font-mono text-[13px] font-bold transition-colors shadow-lg shadow-amber-500/10"
              >
                Применить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
