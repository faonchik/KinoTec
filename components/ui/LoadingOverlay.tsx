"use client";

import React from "react";

/**
 * Универсальный оверлей загрузки, центрированный по экрану.
 * Цвета берутся из текущей темы плеера, но можно переопределить через CSS‑переменные.
 */
export function LoadingOverlay() {
  return (
    <div className="absolute inset-0 bg-[#0D1420] flex items-center justify-center z-10 pointer-events-none">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-[#ffb84d] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="font-mono text-[13px] text-white/45">Загрузка плеера...</p>
      </div>
    </div>
  );
}
