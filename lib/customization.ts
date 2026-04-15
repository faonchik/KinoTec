/**
 * Утилиты для применения кастомизации профиля
 */

import type { CSSProperties } from "react";

/**
 * Получает CSS классы для рамки профиля
 */
export function getFrameClasses(frameValue: string | null | undefined): string {
  if (!frameValue) return "";

  const frameStyles: Record<string, string> = {
    "frame-simple": "border-2 border-slate-400",
    "frame-circle": "border-2 border-slate-400 rounded-full",
    "frame-square": "border-2 border-slate-400",
    "frame-thin": "border border-slate-400",
    "frame-gradient": "border-4 border-transparent bg-gradient-to-r from-amber-400 via-pink-500 to-purple-500 rounded-full p-0.5",
    "frame-neon": "border-2 border-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)]",
    "frame-pixel": "border-2 border-slate-400",
    "frame-double": "border-4 border-slate-400",
    "frame-dashed": "border-2 border-dashed border-slate-400",
    "frame-gold": "border-4 border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.6)]",
    "frame-film": "border-2 border-slate-400",
    "frame-stars": "border-2 border-amber-400",
    "frame-silver": "border-4 border-slate-300 shadow-[0_0_10px_rgba(148,163,184,0.5)]",
    "frame-bronze": "border-4 border-amber-600 shadow-[0_0_10px_rgba(217,119,6,0.5)]",
    "frame-vintage": "border-2 border-amber-700",
    "frame-fire": "border-4 border-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.8)]",
    "frame-ice": "border-4 border-cyan-300 shadow-[0_0_20px_rgba(103,232,249,0.8)]",
    "frame-rainbow": "border-4 border-transparent bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 to-purple-500 rounded-full p-0.5",
    "frame-electric": "border-4 border-blue-400 shadow-[0_0_20px_rgba(96,165,250,0.8)]",
    "frame-space": "border-4 border-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.8)]",
    "frame-hologram": "border-4 border-transparent bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 rounded-full p-0.5",
    "frame-oscar": "border-4 border-amber-500 shadow-[0_0_25px_rgba(245,158,11,1)]",
    "frame-hollywood": "border-4 border-amber-400 shadow-[0_0_25px_rgba(251,191,36,1)]",
    "frame-legend": "border-4 border-purple-500 shadow-[0_0_30px_rgba(168,85,247,1)]",
    "frame-emperor": "border-4 border-amber-600 shadow-[0_0_35px_rgba(217,119,6,1)]",
  };

  return frameStyles[frameValue] || frameStyles["frame-simple"];
}

/**
 * Получает CSS классы для эффекта аватара
 */
export function getAvatarEffectClasses(effectValue: string | null | undefined): string {
  if (!effectValue) return "";

  const effectStyles: Record<string, string> = {
    "effect-pulse": "animate-pulse",
    "effect-glow": "shadow-lg shadow-purple-500/50",
    "effect-sparkle": "relative before:absolute before:inset-0 before:rounded-full before:bg-gradient-to-r before:from-yellow-400 before:via-pink-500 before:to-blue-500 before:opacity-50 before:animate-pulse",
    "effect-shadow": "shadow-2xl shadow-purple-900/50",
    "effect-blur": "backdrop-blur-sm",
    "effect-glare": "relative before:absolute before:inset-0 before:rounded-full before:bg-gradient-to-br before:from-white/20 before:via-transparent before:to-transparent",
    "effect-rotation": "animate-spin-slow",
    "effect-scale": "animate-pulse scale-105",
  };

  return effectStyles[effectValue] || "";
}

/**
 * Получает CSS классы для стиля сообщений в чате
 */
export function getChatBubbleClasses(bubbleValue: string | null | undefined): string {
  if (!bubbleValue) return "";

  const bubbleStyles: Record<string, string> = {
    "bubble-rounded": "rounded-2xl",
    "bubble-square": "rounded-none",
    "bubble-smoothed": "rounded-lg",
    "bubble-shadow": "shadow-lg",
    "bubble-gradient": "bg-gradient-to-r from-amber-500/20 to-orange-500/20",
    "bubble-neon": "border-2 border-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)]",
    "bubble-glow": "shadow-lg shadow-amber-500/50",
    "bubble-outline": "border-2 border-amber-400",
    "bubble-hologram": "bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-blue-500/20 border border-purple-400/50",
    "bubble-rainbow": "bg-gradient-to-r from-red-500/20 via-yellow-500/20 via-green-500/20 via-blue-500/20 to-purple-500/20",
    "bubble-space": "bg-gradient-to-br from-purple-900/30 to-blue-900/30 border border-purple-400/50",
    "bubble-divine": "bg-gradient-to-r from-yellow-400/30 via-amber-500/30 to-orange-500/30 border-2 border-amber-300 shadow-[0_0_20px_rgba(251,191,36,0.6)]",
  };

  return bubbleStyles[bubbleValue] || "";
}

/**
 * Получает стили для фона профиля
 */
export function getBackgroundStyle(backgroundValue: string | null | undefined): CSSProperties {
  if (!backgroundValue) return {};

  // Если это градиент
  if (backgroundValue.startsWith("gradient-")) {
    const gradients: Record<string, string> = {
      "gradient-blue": "linear-gradient(135deg, #3b82f6, #8b5cf6)",
      "gradient-sunset": "linear-gradient(135deg, #f59e0b, #ec4899)",
      "gradient-ice": "linear-gradient(135deg, #0ea5e9, #e0f2fe)",
      "gradient-fire": "linear-gradient(135deg, #ef4444, #f97316)",
      "gradient-space": "linear-gradient(135deg, #1e1b4b, #312e81)",
      "gradient-forest": "linear-gradient(135deg, #065f46, #10b981)",
      "gradient-midnight": "linear-gradient(135deg, #0f172a, #1e293b)",
      "gradient-amethyst": "linear-gradient(135deg, #6b21a8, #9333ea)",
      "gradient-film": "linear-gradient(135deg, #7c2d12, #dc2626)",
      "gradient-hollywood": "linear-gradient(135deg, #78350f, #fbbf24)",
      "gradient-matrix": "linear-gradient(135deg, #064e3b, #10b981)",
      "gradient-cosmos": "linear-gradient(135deg, #1e1b4b, #6366f1)",
    };

    return {
      backgroundImage: gradients[backgroundValue] || gradients["gradient-blue"],
    };
  }

  // Если это URL изображения
  if (backgroundValue.startsWith("http") || backgroundValue.startsWith("/")) {
    return {
      backgroundImage: `url(${backgroundValue})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
    };
  }

  return {};
}

