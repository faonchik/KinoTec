"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

export function KeyboardShortcuts() {
  const router = useRouter();
  const [showHelp, setShowHelp] = useState(false);
  const t = useTranslations("shortcuts");
  const tCommon = useTranslations("common");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Игнорируем если фокус в input/textarea
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      // Shift + / = помощь
      if (e.key === "?" && e.shiftKey) {
        e.preventDefault();
        setShowHelp((prev) => !prev);
        return;
      }

      // G + ... = навигация
      if (e.key === "g") {
        const handleNextKey = (nextEvent: KeyboardEvent) => {
          switch (nextEvent.key) {
            case "h": // Home
              router.push("/");
              break;
            case "m": // Movies
              router.push("/movies");
              break;
            case "s": // Search
              router.push("/search");
              break;
            case "p": // Profile
              router.push("/profile");
              break;
            case "c": // Calendar
              router.push("/calendar");
              break;
            case "r": // Roulette
              router.push("/roulette");
              break;
          }
          document.removeEventListener("keydown", handleNextKey);
        };

        document.addEventListener("keydown", handleNextKey, { once: true });
        
        // Таймаут для очистки
        setTimeout(() => {
          document.removeEventListener("keydown", handleNextKey);
        }, 1500);
        return;
      }

      // / = фокус на поиск
      if (e.key === "/" && !e.shiftKey) {
        e.preventDefault();
        router.push("/search");
        return;
      }

      // Escape = закрыть модалки
      if (e.key === "Escape") {
        setShowHelp(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [router]);

  if (!showHelp) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={() => setShowHelp(false)}
    >
      <div
        className="bg-slate-900 rounded-2xl border border-slate-700 p-8 max-w-lg w-full mx-4 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">⌨️ Горячие клавиши</h2>
          <button
            onClick={() => setShowHelp(false)}
            className="text-slate-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-amber-400 font-semibold mb-3">{t("navigation")}</h3>
            <div className="space-y-2">
              <ShortcutRow keys={["G", "H"]} description={t("home")} />
              <ShortcutRow keys={["G", "M"]} description={t("movies")} />
              <ShortcutRow keys={["G", "S"]} description={t("search")} />
              <ShortcutRow keys={["G", "P"]} description={t("profile")} />
              <ShortcutRow keys={["G", "C"]} description={t("calendar")} />
              <ShortcutRow keys={["G", "R"]} description={t("roulette")} />
            </div>
          </div>

          <div>
            <h3 className="text-amber-400 font-semibold mb-3">{t("quickActions")}</h3>
            <div className="space-y-2">
              <ShortcutRow keys={["/"]} description={t("searchFocus")} />
              <ShortcutRow keys={["?"]} description={t("help")} />
              <ShortcutRow keys={["Esc"]} description={tCommon("close")} />
            </div>
          </div>
        </div>

        <p className="text-slate-500 text-sm mt-6 text-center">
          {tCommon("press")} <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-300">Esc</kbd> {tCommon("toClose")}
        </p>
      </div>
    </div>
  );
}

function ShortcutRow({ keys, description }: { keys: string[]; description: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-slate-300">{description}</span>
      <div className="flex gap-1">
        {keys.map((key, idx) => (
          <span key={idx}>
            <kbd className="px-2 py-1 bg-slate-800 border border-slate-700 rounded text-sm text-white min-w-[28px] text-center inline-block">
              {key}
            </kbd>
            {idx < keys.length - 1 && <span className="text-slate-600 mx-1">→</span>}
          </span>
        ))}
      </div>
    </div>
  );
}

