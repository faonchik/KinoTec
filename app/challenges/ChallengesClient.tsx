"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";

interface Challenge {
  id: string;
  title: string;
  slug: string;
  description: string;
  cover?: string | null;
  coverMovie?: string | null;
  type: string;
  goal: number;
  points: number;
  startDate?: Date | null;
  endDate?: Date | null;
  conditions?: unknown;
  _count: { participants: number };
  participants?: { id: string; progress: number; completed: boolean }[];
}

interface UserChallenge {
  id: string;
  progress: number;
  completed: boolean;
  completedAt?: Date | null;
  challenge: Challenge;
}

interface ChallengesClientProps {
  challenges: Challenge[];
  userProgress: UserChallenge[];
  isLoggedIn: boolean;
}

const challengeTypeLabels: Record<string, string> = {
  GENRE: "🎭 Жанр",
  DIRECTOR: "🎬 Режиссёр",
  ACTOR: "👤 Актёр",
  YEAR: "📅 Год",
  COUNTRY: "🌍 Страна",
  MARATHON: "🏃 Марафон",
  CUSTOM: "⭐ Особый",
};

const challengeTypeColors: Record<string, string> = {
  GENRE: "from-purple-500 to-pink-600",
  DIRECTOR: "from-blue-500 to-cyan-600",
  ACTOR: "from-green-500 to-emerald-600",
  YEAR: "from-yellow-500 to-orange-600",
  COUNTRY: "from-red-500 to-rose-600",
  MARATHON: "from-indigo-500 to-violet-600",
  CUSTOM: "from-amber-500 to-orange-600",
};

export function ChallengesClient({ challenges, userProgress, isLoggedIn }: ChallengesClientProps) {
  const t = useTranslations("challenges");
  const router = useRouter();
  const [joiningId, setJoiningId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");

  const userProgressMap = new Map(
    userProgress.map((up) => [up.challenge.id, up])
  );

  const handleJoin = async (challengeId: string) => {
    if (!isLoggedIn) {
      router.push("/auth/signin");
      return;
    }

    setJoiningId(challengeId);

    try {
      const res = await fetch(`/api/challenges/${challengeId}/join`, {
        method: "POST",
      });

      if (res.ok) {
        router.refresh();
      }
    } catch (error) {
      console.error("Join error:", error);
    } finally {
      setJoiningId(null);
    }
  };

  const filteredChallenges = challenges.filter((challenge) => {
    const progress = userProgressMap.get(challenge.id);
    
    if (filter === "active") {
      return progress && !progress.completed;
    }
    if (filter === "completed") {
      return progress?.completed;
    }
    return true;
  });

  const activeCount = userProgress.filter((up) => !up.completed).length;
  const completedCount = userProgress.filter((up) => up.completed).length;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Заголовок */}
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold mb-4">
          <span className="text-gradient">🎯 Челленджи</span>
        </h1>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto">
          Принимайте киновызовы, смотрите фильмы и зарабатывайте очки!
        </p>
      </div>

      {/* Статистика пользователя */}
      {isLoggedIn && userProgress.length > 0 && (
        <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto mb-8">
          <div className="bg-slate-800/50 rounded-xl p-4 text-center border border-slate-700/50">
            <p className="text-3xl font-bold text-white">{userProgress.length}</p>
            <p className="text-slate-400 text-sm">Принято</p>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-4 text-center border border-amber-500/30">
            <p className="text-3xl font-bold text-amber-400">{activeCount}</p>
            <p className="text-slate-400 text-sm">В процессе</p>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-4 text-center border border-green-500/30">
            <p className="text-3xl font-bold text-green-400">{completedCount}</p>
            <p className="text-slate-400 text-sm">Завершено</p>
          </div>
        </div>
      )}

      {/* Фильтры */}
      <div className="flex justify-center gap-2 mb-8">
        {[
          { id: "all", label: "Все" },
          { id: "active", label: "Мои активные" },
          { id: "completed", label: "Завершённые" },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id as typeof filter)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === f.id
                ? "bg-amber-500 text-black"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Список челленджей */}
      {filteredChallenges.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🎯</div>
          <p className="text-slate-400 text-lg">
            {filter === "all"
              ? t("empty")
              : filter === "active"
              ? t("noActive")
              : t("noCompleted")}
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredChallenges.map((challenge) => {
            const progress = userProgressMap.get(challenge.id);
            const isJoined = !!progress;
            const isCompleted = progress?.completed;
            const progressPercent = progress
              ? Math.min((progress.progress / challenge.goal) * 100, 100)
              : 0;

            return (
              <article
                key={challenge.id}
                className={`relative bg-slate-800/50 rounded-2xl overflow-hidden border transition-all ${
                  isCompleted
                    ? "border-green-500/50"
                    : isJoined
                    ? "border-amber-500/50"
                    : "border-slate-700/50 hover:border-slate-600/50"
                }`}
              >
                {/* Header with movie poster */}
                <div className={`relative h-32 bg-gradient-to-r ${challengeTypeColors[challenge.type] || "from-slate-600 to-slate-700"} overflow-hidden`}>
                  {challenge.coverMovie ? (
                    <>
                      <Image
                        src={challenge.coverMovie}
                        alt={challenge.title}
                        fill
                        className="object-cover opacity-30"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-5xl">
                        {challenge.type === "MARATHON" ? "🏃" : "🎯"}
                      </span>
                    </div>
                  )}
                </div>

                {/* Completed badge */}
                {isCompleted && (
                  <div className="absolute top-3 right-3 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">
                    ✓ Завершён
                  </div>
                )}

                {/* Content */}
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded">
                      {challengeTypeLabels[challenge.type] || challenge.type}
                    </span>
                    <span className="text-xs text-amber-400">+{challenge.points} очков</span>
                  </div>

                  <h2 className="text-xl font-bold text-white mb-2">
                    {challenge.title}
                  </h2>

                  <p className="text-slate-400 text-sm mb-4 line-clamp-2">
                    {challenge.description}
                  </p>

                  {/* Progress */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-400">Прогресс</span>
                      <span className="text-white">
                        {progress?.progress || 0} / {challenge.goal}
                      </span>
                    </div>
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${
                          isCompleted
                            ? "bg-green-500"
                            : "bg-gradient-to-r from-amber-500 to-orange-600"
                        }`}
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">
                      👥 {challenge._count.participants} участников
                    </span>

                    {!isJoined ? (
                      <Button
                        size="sm"
                        onClick={() => handleJoin(challenge.id)}
                        disabled={joiningId === challenge.id}
                      >
                        {joiningId === challenge.id ? "..." : "Принять вызов"}
                      </Button>
                    ) : isCompleted ? (
                      <span className="text-green-400 text-sm font-medium">
                        🏆 Выполнено!
                      </span>
                    ) : (
                      <span className="text-amber-400 text-sm font-medium">
                        В процессе...
                      </span>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

