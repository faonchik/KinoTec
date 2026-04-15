"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

interface User {
  id: string;
  name: string | null;
  email: string;
  avatar: string | null;
  role: string;
  coins: number;
  createdAt: Date;
  _count: {
    reviews: number;
    ratings: number;
    favorites: number;
    watchlists: number;
  };
}

interface UsersClientProps {
  users: User[];
}

export function UsersClient({ users: initialUsers }: UsersClientProps) {
  const [users, setUsers] = useState(initialUsers);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [coinAmount, setCoinAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleCoinChange = async (userId: string) => {
    const numAmount = parseInt(coinAmount);
    if (isNaN(numAmount) || numAmount === 0) {
      setMessage({ type: "error", text: "Введите корректную сумму (не ноль)" });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/admin/users/coins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          amount: numAmount,
          description: numAmount > 0 ? `Начислено админом` : `Списано админом`,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        // Обновляем баланс пользователя в списке
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, coins: data.newBalance } : u))
        );
        setMessage({
          type: "success",
          text: numAmount > 0 ? `Начислено ${numAmount} монет` : `Списано ${Math.abs(numAmount)} монет`,
        });
        setEditingUserId(null);
        setCoinAmount("");
      } else {
        setMessage({ type: "error", text: data.error || "Ошибка" });
      }
    } catch {
      setMessage({ type: "error", text: "Ошибка сети" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {message && (
        <div
          className={`mb-4 p-4 rounded-lg ${
            message.type === "success"
              ? "bg-green-500/20 text-green-400 border border-green-500/50"
              : "bg-red-500/20 text-red-400 border border-red-500/50"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-800">
            <tr>
              <th className="text-left p-4 text-slate-400 font-medium">Пользователь</th>
              <th className="text-left p-4 text-slate-400 font-medium">Роль</th>
              <th className="text-left p-4 text-slate-400 font-medium">Монеты</th>
              <th className="text-left p-4 text-slate-400 font-medium">Активность</th>
              <th className="text-left p-4 text-slate-400 font-medium">Дата регистрации</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-slate-700/30">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    {user.avatar ? (
                      <Image
                        src={user.avatar}
                        alt={user.name || user.email}
                        width={40}
                        height={40}
                        className="rounded-full"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center">
                        <span className="text-slate-400 text-sm">
                          {(user.name || user.email)[0].toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div>
                      <p className="text-white font-medium">{user.name || "Без имени"}</p>
                      <p className="text-slate-500 text-sm">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  {user.role === "ADMIN" ? (
                    <Badge variant="primary" className="bg-red-500/20 text-red-400 border-red-500/50">
                      Админ
                    </Badge>
                  ) : user.role === "MODERATOR" ? (
                    <Badge variant="primary" className="bg-blue-500/20 text-blue-400 border-blue-500/50">
                      Модератор
                    </Badge>
                  ) : (
                    <Badge variant="primary" className="bg-slate-500/20 text-slate-400 border-slate-500/50">
                      Пользователь
                    </Badge>
                  )}
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <span className="text-amber-400 font-bold">💰 {user.coins.toLocaleString()}</span>
                    {editingUserId === user.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={coinAmount}
                          onChange={(e) => setCoinAmount(e.target.value)}
                          placeholder="Сумма"
                          className="w-20 px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white text-sm"
                          autoFocus
                        />
                        <Button
                          size="sm"
                          onClick={() => handleCoinChange(user.id, 0)}
                          disabled={isLoading || !coinAmount}
                        >
                          ✓
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => {
                            setEditingUserId(null);
                            setCoinAmount("");
                          }}
                        >
                          ✕
                        </Button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setEditingUserId(user.id)}
                        className="text-xs text-amber-400 hover:text-amber-300 underline"
                        title="Изменить баланс"
                      >
                        Изменить
                      </button>
                    )}
                  </div>
                </td>
                <td className="p-4 text-slate-300">
                  <div className="text-sm">
                    <div>Отзывов: {user._count.reviews}</div>
                    <div>Оценок: {user._count.ratings}</div>
                    <div>Избранное: {user._count.favorites}</div>
                  </div>
                </td>
                <td className="p-4 text-slate-400">
                  {new Date(user.createdAt).toLocaleDateString("ru-RU")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

