"use client";

interface ItemPreviewProps {
  type: string;
  value: string;
  name: string;
}

export function ItemPreview({ type, value, name }: ItemPreviewProps) {
  if (type === "PROFILE_BADGE") {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-2">
        <div className="relative">
          {/* Профиль с аватаром */}
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 border-2 border-slate-600 flex items-center justify-center">
            <span className="text-3xl">👤</span>
          </div>
          {/* Значок рядом */}
          <div className="absolute -right-1 -top-1 bg-slate-800 rounded-full p-1.5 border-2 border-amber-400 shadow-lg">
            <span className="text-xl">{value}</span>
          </div>
        </div>
        <div className="text-center px-2">
          <div className="flex items-center justify-center gap-1.5 text-xs text-slate-300 bg-slate-800/50 px-2 py-1 rounded">
            <span className="text-base">{value}</span>
            <span>Имя</span>
          </div>
        </div>
      </div>
    );
  }

  if (type === "NAME_COLOR") {
    const isGradient = value.startsWith("gradient");
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3">
        <div className="w-full px-4">
          {/* Превью профиля */}
          <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center">
                <span className="text-xl">👤</span>
              </div>
              <div className="flex-1">
                <div
                  className="text-lg font-bold"
                  style={{
                    color: isGradient ? undefined : value,
                    backgroundImage: isGradient
                      ? "linear-gradient(45deg, #f59e0b, #ec4899, #8b5cf6, #3b82f6)"
                      : undefined,
                    WebkitBackgroundClip: isGradient ? "text" : undefined,
                    WebkitTextFillColor: isGradient ? "transparent" : undefined,
                    backgroundClip: isGradient ? "text" : undefined,
                  }}
                >
                  {name}
                </div>
                <div className="text-xs text-slate-500">Пользователь</div>
              </div>
            </div>
            {/* Превью в комментарии */}
            <div className="bg-slate-700/50 rounded p-2">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-6 h-6 rounded-full bg-slate-600"></div>
                <div
                  className="text-sm font-semibold"
                  style={{
                    color: isGradient ? undefined : value,
                    backgroundImage: isGradient
                      ? "linear-gradient(45deg, #f59e0b, #ec4899, #8b5cf6, #3b82f6)"
                      : undefined,
                    WebkitBackgroundClip: isGradient ? "text" : undefined,
                    WebkitTextFillColor: isGradient ? "transparent" : undefined,
                    backgroundClip: isGradient ? "text" : undefined,
                  }}
                >
                  Имя
                </div>
                <span className="text-xs text-slate-400">2 часа назад</span>
              </div>
              <p className="text-xs text-slate-300">Отличный фильм!</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (type === "PROFILE_FRAME") {
    const frameStyles: Record<string, string> = {
      "frame-simple": "border-2 border-slate-400",
      "frame-circle": "border-2 border-slate-400 rounded-full",
      "frame-gradient": "border-4 border-transparent bg-gradient-to-r from-amber-400 via-pink-500 to-purple-500 rounded-full p-0.5",
      "frame-neon": "border-2 border-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)]",
      "frame-gold": "border-4 border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.6)]",
      "frame-fire": "border-4 border-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.8)]",
      "frame-oscar": "border-4 border-amber-500 shadow-[0_0_25px_rgba(245,158,11,1)]",
    };

    const frameClass = frameStyles[value] || frameStyles["frame-simple"];

    return (
      <div className="flex flex-col items-center justify-center h-full gap-3">
        <div className="relative">
          {/* Аватар с рамкой */}
          <div className={`w-28 h-28 ${frameClass} flex items-center justify-center`}>
            <div className="w-full h-full rounded-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center">
              <span className="text-5xl">👤</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (type === "AVATAR_EFFECT") {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3">
        <div className="relative">
          {/* Аватар */}
          <div className="w-28 h-28 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center">
            <span className="text-5xl">👤</span>
          </div>
          {/* Эффект - пульсирующие кольца */}
          <div className="absolute inset-0 rounded-full border-2 border-purple-400 animate-ping opacity-75"></div>
          <div className="absolute -inset-2 rounded-full border border-purple-300/50 animate-pulse"></div>
          <div className="absolute -inset-4 rounded-full border border-purple-200/30 animate-pulse" style={{ animationDelay: "0.5s" }}></div>
          {/* Искры */}
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 text-yellow-400 animate-bounce">✨</div>
          <div className="absolute -bottom-2 left-1/4 text-pink-400 animate-bounce" style={{ animationDelay: "0.3s" }}>✨</div>
          <div className="absolute -bottom-2 right-1/4 text-blue-400 animate-bounce" style={{ animationDelay: "0.6s" }}>✨</div>
        </div>
      </div>
    );
  }

  if (type === "THEME") {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3">
        <div className="w-full px-4">
          {/* Превью темы */}
          <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center">
                <span className="text-sm">🎬</span>
              </div>
              <div className="flex-1 h-2 bg-slate-700 rounded"></div>
            </div>
            <div className="space-y-2">
              <div className="h-3 bg-slate-700 rounded w-3/4"></div>
              <div className="h-3 bg-slate-700 rounded w-full"></div>
              <div className="h-3 bg-slate-700 rounded w-5/6"></div>
            </div>
            <div className="mt-3 flex gap-2">
              <div className="flex-1 h-16 bg-slate-700 rounded"></div>
              <div className="flex-1 h-16 bg-slate-700 rounded"></div>
            </div>
          </div>
        </div>
        <div className="text-center">
          <div className="text-xs text-slate-400 mb-1">Использование:</div>
          <div className="text-xs text-white bg-slate-800/50 px-3 py-1.5 rounded-lg">
            Меняет цветовую схему всего сайта
          </div>
        </div>
      </div>
    );
  }

  if (type === "CHAT_BUBBLE") {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3">
        <div className="w-full px-4">
          {/* Превью чата */}
          <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
            <div className="space-y-2">
              <div className="flex justify-end">
                <div className="bg-amber-500/20 border border-amber-500/50 rounded-lg rounded-br-none px-3 py-2 max-w-[80%]">
                  <p className="text-xs text-amber-300">Привет! Как дела?</p>
                </div>
              </div>
              <div className="flex justify-start">
                <div className="bg-slate-700 rounded-lg rounded-bl-none px-3 py-2 max-w-[80%]">
                  <p className="text-xs text-slate-300">Всё отлично!</p>
                </div>
              </div>
              <div className="flex justify-end">
                <div className="bg-amber-500/20 border border-amber-500/50 rounded-lg rounded-br-none px-3 py-2 max-w-[80%]">
                  <p className="text-xs text-amber-300">Круто! 🎉</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (type === "BACKGROUND") {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3">
        <div className="w-full px-4">
          {/* Превью фона профиля */}
          <div className="relative h-24 rounded-lg overflow-hidden border border-slate-700">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600"></div>
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="absolute bottom-2 left-2 right-2">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-slate-800/80 border-2 border-white/20 flex items-center justify-center">
                  <span className="text-lg">👤</span>
                </div>
                <div className="flex-1">
                  <div className="h-3 bg-white/20 rounded mb-1"></div>
                  <div className="h-2 bg-white/10 rounded w-2/3"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (type === "EMOJI_PACK") {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3">
        <div className="w-full px-4">
          {/* Превью эмодзи */}
          <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
            <div className="grid grid-cols-4 gap-3 mb-3">
              {["😀", "😎", "🎉", "🔥", "⭐", "💎", "🚀", "👑"].map((emoji, i) => (
                <div key={i} className="text-3xl text-center bg-slate-700/50 rounded p-2">
                  {emoji}
                </div>
              ))}
            </div>
            {/* Превью использования */}
            <div className="bg-slate-700/50 rounded p-2">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-6 h-6 rounded-full bg-slate-600"></div>
                <span className="text-xs text-slate-300">Пользователь</span>
              </div>
              <p className="text-xs text-slate-300">Отличный фильм! 😀 🎉 🔥</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Дефолтный превью
  return (
    <div className="flex flex-col items-center justify-center h-full gap-3">
      <div className="text-6xl">🎁</div>
      <div className="text-center">
        <div className="text-xs text-slate-400">Товар</div>
      </div>
    </div>
  );
}

