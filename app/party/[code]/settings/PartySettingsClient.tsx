"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

interface User {
  id: string;
  name: string | null;
  avatar: string | null;
}

interface Party {
  id: string;
  code: string;
  name: string | null;
  isActive: boolean;
  isPublic: boolean;
  password: string | null;
  maxUsers: number;
  movie: { id: string; title: string; poster: string | null };
  participants: Array<{ user: User }>;
}

interface PartySettingsClientProps {
  party: Party;
}

export function PartySettingsClient({ party }: PartySettingsClientProps) {
  const router = useRouter();
  const [name, setName] = useState(party.name || "");
  const [isPublic, setIsPublic] = useState(party.isPublic);
  const [password, setPassword] = useState(party.password || "");
  const [maxUsers, setMaxUsers] = useState(party.maxUsers);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [message, setMessage] = useState("");

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage("");

    try {
      const res = await fetch(`/api/party/${party.code}/settings`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name || null,
          isPublic,
          password: isPublic ? null : password,
          maxUsers,
        }),
      });

      if (res.ok) {
        setMessage("✅ Настройки сохранены");
        setTimeout(() => setMessage(""), 3000);
      } else {
        const data = await res.json();
        setMessage(`❌ ${data.error || "Ошибка сохранения"}`);
      }
    } catch {
      setMessage("❌ Ошибка сети");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Удалить комнату? Это действие нельзя отменить.")) return;

    setIsDeleting(true);

    try {
      const res = await fetch(`/api/party/${party.code}`, {
        method: "DELETE",
      });

      if (res.ok) {
        router.push("/party");
      } else {
        setMessage("❌ Ошибка удаления");
      }
    } catch {
      setMessage("❌ Ошибка сети");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleKickUser = async (userId: string) => {
    try {
      await fetch(`/api/party/${party.code}/kick`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      router.refresh();
    } catch {
      setMessage("❌ Ошибка");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Заголовок */}
        <div className="flex items-center gap-4 mb-8">
          <Link href={`/party/${party.code}`}>
            <Button variant="secondary" size="sm">
              ← Назад
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">⚙️ Настройки комнаты</h1>
            <p className="text-slate-400">Код: {party.code}</p>
          </div>
        </div>

        {/* Форма настроек */}
        <form onSubmit={handleSave} className="space-y-6">
          {/* Фильм */}
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 flex items-center gap-4">
            {party.movie.poster && (
              <Image
                src={party.movie.poster}
                alt={party.movie.title}
                width={60}
                height={90}
                className="rounded-lg"
              />
            )}
            <div>
              <p className="text-slate-400 text-sm">Фильм</p>
              <p className="text-white font-medium">{party.movie.title}</p>
            </div>
          </div>

          {/* Название комнаты */}
          <div>
            <label className="block text-white font-medium mb-2">
              Название комнаты (опционально)
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Например: Вечерний киносеанс"
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Тип комнаты */}
          <div>
            <label className="block text-white font-medium mb-3">Тип комнаты</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setIsPublic(true)}
                className={`p-4 rounded-xl border-2 transition-colors ${
                  isPublic
                    ? "border-green-500 bg-green-500/10"
                    : "border-slate-700 bg-slate-800/50 hover:border-slate-600"
                }`}
              >
                <div className="text-2xl mb-2">🔓</div>
                <div className="text-white font-medium">Открытая</div>
                <p className="text-slate-400 text-sm">Любой может войти</p>
              </button>

              <button
                type="button"
                onClick={() => setIsPublic(false)}
                className={`p-4 rounded-xl border-2 transition-colors ${
                  !isPublic
                    ? "border-red-500 bg-red-500/10"
                    : "border-slate-700 bg-slate-800/50 hover:border-slate-600"
                }`}
              >
                <div className="text-2xl mb-2">🔒</div>
                <div className="text-white font-medium">Закрытая</div>
                <p className="text-slate-400 text-sm">Нужен пароль</p>
              </button>
            </div>
          </div>

          {/* Пароль */}
          {!isPublic && (
            <div>
              <label className="block text-white font-medium mb-2">Пароль комнаты</label>
              <input
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Введите пароль"
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>
          )}

          {/* Макс. пользователей */}
          <div>
            <label className="block text-white font-medium mb-2">
              Максимум участников: {maxUsers}
            </label>
            <input
              type="range"
              min="2"
              max="50"
              value={maxUsers}
              onChange={(e) => setMaxUsers(parseInt(e.target.value))}
              className="w-full accent-amber-500"
            />
            <div className="flex justify-between text-slate-500 text-sm">
              <span>2</span>
              <span>50</span>
            </div>
          </div>

          {/* Сообщение */}
          {message && (
            <div className={`p-3 rounded-lg ${message.startsWith("✅") ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
              {message}
            </div>
          )}

          {/* Кнопки */}
          <div className="flex gap-3">
            <Button type="submit" disabled={isSaving} className="flex-1">
              {isSaving ? "Сохранение..." : "Сохранить"}
            </Button>
          </div>
        </form>

        {/* Участники */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-white mb-4">
            👥 Участники ({party.participants.length})
          </h2>
          <div className="bg-slate-800/50 rounded-xl border border-slate-700 divide-y divide-slate-700">
            {party.participants.map((p) => (
              <div key={p.user.id} className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  {p.user.avatar ? (
                    <Image
                      src={p.user.avatar}
                      alt={p.user.name || ""}
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-slate-600 rounded-full flex items-center justify-center text-white">
                      {p.user.name?.[0] || "?"}
                    </div>
                  )}
                  <span className="text-white">{p.user.name}</span>
                </div>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleKickUser(p.user.id)}
                >
                  Выгнать
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Опасная зона */}
        <div className="mt-8 pt-8 border-t border-slate-700">
          <h2 className="text-xl font-semibold text-red-400 mb-4">⚠️ Опасная зона</h2>
          <Button
            variant="danger"
            onClick={handleDelete}
            disabled={isDeleting}
            className="w-full"
          >
            {isDeleting ? "Удаление..." : "🗑️ Удалить комнату"}
          </Button>
        </div>
      </div>
    </div>
  );
}

