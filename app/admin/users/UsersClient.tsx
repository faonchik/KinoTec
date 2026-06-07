"use client";

import { useState } from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/Badge";

interface User {
  id: string;
  name: string | null;
  email: string;
  avatar: string | null;
  role: string;
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
  const [users] = useState(initialUsers);

  return (
    <>
      <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden overflow-x-auto">
        <table className="w-full min-w-[640px]">
          <thead className="bg-slate-800">
            <tr>
              <th className="text-left p-4 text-slate-400 font-medium">Пользователь</th>
              <th className="text-left p-4 text-slate-400 font-medium">Роль</th>
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

