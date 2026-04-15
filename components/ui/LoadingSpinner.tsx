"use client";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  text?: string;
}

export function LoadingSpinner({ size = "md", className = "", text }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-16 h-16",
    lg: "w-24 h-24",
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      {/* Кинолента с перфорацией */}
      <div className="relative">
        {/* Верхняя перфорация */}
        <div className="absolute -top-2 left-0 right-0 flex justify-between px-1">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="w-1 h-1 bg-amber-500 rounded-full animate-pulse"
              style={{ animationDelay: `${i * 0.1}s` }}
            />
          ))}
        </div>

        {/* Центральная часть - кадры фильма */}
        <div className={`${sizeClasses[size]} relative overflow-hidden rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-600/20 border-2 border-amber-500/50 shadow-lg shadow-amber-500/20`}>
          {/* Анимированные полосы как в старом кино */}
          <div className="absolute inset-0 flex flex-col">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="flex-1 bg-gradient-to-r from-transparent via-amber-500/30 to-transparent animate-shimmer"
                style={{
                  animationDelay: `${i * 0.2}s`,
                  animationDuration: "1.5s",
                }}
              />
            ))}
          </div>

          {/* Центральный символ - вращающаяся плёнка */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              {/* Вращающиеся концентрические круги */}
              <svg
                className={`${sizeClasses[size]} text-amber-500 animate-spin`}
                style={{ animationDuration: "2s" }}
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeDasharray="8 4"
                  className="opacity-30"
                />
                <circle
                  cx="12"
                  cy="12"
                  r="6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeDasharray="4 2"
                  className="opacity-50"
                  style={{ animationDirection: "reverse", animationDuration: "1.5s" }}
                />
                <circle
                  cx="12"
                  cy="12"
                  r="2"
                  fill="currentColor"
                  className="animate-pulse"
                />
              </svg>

              {/* Иконка камеры в центре */}
              <div className="absolute inset-0 flex items-center justify-center">
                <svg
                  className={`${size === "sm" ? "w-4 h-4" : size === "md" ? "w-6 h-6" : "w-8 h-8"} text-amber-400`}
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M9.5 3l-2 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2h-3.5l-2-4h-5zm0 2h5l1 2h4v10H4V7h4.5l1-2zM12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 6c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Нижняя перфорация */}
          <div className="absolute -bottom-2 left-0 right-0 flex justify-between px-1">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="w-1 h-1 bg-amber-500 rounded-full animate-pulse"
                style={{ animationDelay: `${(i + 4) * 0.1}s` }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Текст загрузки */}
      {text && (
        <p className="mt-4 text-slate-400 text-sm animate-pulse font-medium">{text}</p>
      )}
    </div>
  );
}

// Альтернативный вариант - кинолента с кадрами
export function FilmReelSpinner({ size = "md", className = "" }: Omit<LoadingSpinnerProps, "text">) {
  const sizeClasses = {
    sm: "w-12 h-12",
    md: "w-20 h-20",
    lg: "w-32 h-32",
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className={`${sizeClasses[size]} relative`}>
        {/* Вращающаяся катушка */}
        <svg
          className="w-full h-full animate-spin"
          style={{ animationDuration: "1s" }}
          viewBox="0 0 100 100"
        >
          {/* Внешний круг */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="url(#gradient)"
            strokeWidth="3"
            strokeDasharray="5 5"
          />
          {/* Внутренний круг */}
          <circle
            cx="50"
            cy="50"
            r="30"
            fill="none"
            stroke="url(#gradient)"
            strokeWidth="2"
            strokeDasharray="3 3"
          />
          {/* Центральное отверстие */}
          <circle cx="50" cy="50" r="15" fill="#1e293b" />
          
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="50%" stopColor="#f97316" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>
          </defs>
        </svg>

        {/* Перфорации */}
        {[...Array(8)].map((_, i) => {
          const angle = (i * 360) / 8;
          const rad = (angle * Math.PI) / 180;
          const x = 50 + 40 * Math.cos(rad);
          const y = 50 + 40 * Math.sin(rad);
          return (
            <div
              key={i}
              className="absolute w-2 h-2 bg-amber-500 rounded-full"
              style={{
                left: `${x}%`,
                top: `${y}%`,
                transform: "translate(-50%, -50%)",
                animation: `pulse 1s ease-in-out ${i * 0.125}s infinite`,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

// Вариант с попкорном (для развлечения)
export function PopcornSpinner({ className = "" }: { className?: string }) {
  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className="relative w-16 h-16">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="absolute text-2xl animate-bounce"
            style={{
              left: `${20 + i * 15}%`,
              animationDelay: `${i * 0.1}s`,
              animationDuration: "0.6s",
            }}
          >
            🍿
          </div>
        ))}
      </div>
      <p className="mt-4 text-slate-400 text-sm animate-pulse">Загрузка...</p>
    </div>
  );
}

