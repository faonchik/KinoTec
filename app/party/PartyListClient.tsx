"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

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
  maxUsers: number;
  createdAt: Date;
  host: User;
  movie: {
    id: string;
    title: string;
    poster: string | null;
  };
  participants: Array<{ user: User }>;
}

interface MyParty {
  id: string;
  code: string;
  name: string | null;
  isActive: boolean;
  isPublic: boolean;
  movie: { id: string; title: string; poster: string | null };
  participants: Array<{ id: string }>;
}

interface PartyListClientProps {
  parties: Party[];
  myParties: MyParty[];
  currentUserId: string | null;
  isAuthenticated: boolean;
}

export function PartyListClient({
  parties,
  myParties,
  currentUserId,
  isAuthenticated,
}: PartyListClientProps) {
  const router = useRouter();
  const [joinCode, setJoinCode] = useState("");
  const [password, setPassword] = useState("");
  const [selectedParty, setSelectedParty] = useState<Party | null>(null);
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"active" | "my" | "ended">("active");
  const [searchQuery, setSearchQuery] = useState("");

  const handleJoinByCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim()) return;
    router.push(`/party/${joinCode.trim().toUpperCase()}`);
  };

  const handleJoinParty = async (party: Party) => {
    if (!isAuthenticated) {
      router.push("/auth/signin");
      return;
    }

    if (!party.isPublic) {
      setSelectedParty(party);
      return;
    }

    setIsJoining(true);
    try {
      const res = await fetch(`/api/party/${party.code}/join`, {
        method: "POST",
      });

      if (res.ok) {
        router.push(`/party/${party.code}`);
      } else {
        const data = await res.json();
        setError(data.error || "Ошибка при входе");
      }
    } catch {
      setError("Ошибка сети");
    } finally {
      setIsJoining(false);
    }
  };

  const handleJoinPrivate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedParty) return;

    setIsJoining(true);
    setError("");

    try {
      const res = await fetch(`/api/party/${selectedParty.code}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        router.push(`/party/${selectedParty.code}`);
      } else {
        const data = await res.json();
        setError(data.error || "Неверный пароль");
      }
    } catch {
      setError("Ошибка сети");
    } finally {
      setIsJoining(false);
    }
  };

  const publicParties = parties.filter((p) => p.isPublic);
  const filteredParties = publicParties.filter(
    (p) => !searchQuery || p.movie.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const tabs = [
    { id: "active" as const, label: "Активные комнаты", count: publicParties.length },
    { id: "my" as const, label: "Мои комнаты", count: myParties.length },
    { id: "ended" as const, label: "Завершённые", count: 0 },
  ];

  return (
    <div className="min-h-screen bg-[#151C2C]">
      {/* Header */}
      <div className="flex items-center justify-between px-12 pt-10 pb-2">
        <div>
          <div className="flex items-center gap-3">
            <span className="text-2xl">🎬</span>
            <h1 className="font-oswald text-3xl font-bold text-white">Совместный просмотр</h1>
          </div>
          <p className="font-mono text-[13px] text-[#8B95A8] mt-2">Смотрите фильмы вместе с друзьями в реальном времени</p>
        </div>

        {isAuthenticated && (
          <Link href="/party/create">
            <button className="flex items-center gap-2 bg-[#FF8C00] hover:bg-[#FF9F2E] text-white font-mono text-[13px] font-semibold px-6 py-3 rounded-2xl transition-colors">
              <span>+</span> Создать комнату
            </button>
          </Link>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 px-12 py-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`font-mono text-[13px] font-medium px-5 py-2.5 rounded-[10px] transition-colors ${
              activeTab === tab.id
                ? "bg-[#FF8C00] text-white"
                : "bg-[#1A2236] text-[#8B95A8] hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search & Filters */}
      <div className="flex items-center gap-4 px-12 py-2">
        <div className="flex-1 relative">
          <svg className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#5A6478]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск комнаты..."
            className="w-full h-[44px] bg-[#1A2236] rounded-[14px] pl-12 pr-5 font-mono text-[13px] text-white placeholder-[#5A6478] border-none outline-none focus:ring-1 focus:ring-[#FF8400]/50 transition-all"
          />
        </div>
        <span className="font-mono text-[13px] text-[#4B5A72]">
          Найдено: {filteredParties.length} комнат
        </span>
      </div>

      {/* Join by code form */}
      <div className="px-12 py-4">
        <form onSubmit={handleJoinByCode} className="flex items-center gap-3">
          <input
            type="text"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            placeholder="Введите код комнаты"
            maxLength={6}
            className="max-w-[200px] h-[44px] bg-[#1A2236] rounded-[14px] px-4 font-mono text-[13px] text-white tracking-widest uppercase placeholder-[#5A6478] border-none outline-none focus:ring-1 focus:ring-[#FF8400]/50"
          />
          <button
            type="submit"
            disabled={!joinCode.trim()}
            className="h-[44px] bg-[#FF8C00] hover:bg-[#FF9F2E] disabled:opacity-40 text-white font-mono text-[13px] font-semibold px-6 rounded-[14px] transition-colors"
          >
            Войти
          </button>
        </form>
      </div>

      {/* Content */}
      <div className="px-12 py-4 pb-10">
        {activeTab === "active" && (
          <>
            {/* Featured room */}
            {filteredParties.length > 0 && (
              <div
                className="relative h-[220px] rounded-[20px] overflow-hidden bg-[#1A2236] mb-6 cursor-pointer group"
                onClick={() => handleJoinParty(filteredParties[0])}
              >
                {filteredParties[0].movie.poster && (
                  <Image
                    src={filteredParties[0].movie.poster}
                    alt={filteredParties[0].movie.title}
                    fill
                    className="object-cover opacity-50 group-hover:scale-105 transition-transform duration-500"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
                <div className="absolute bottom-6 left-6">
                  <span className="font-mono text-[10px] bg-red-500 text-white px-2 py-0.5 rounded mb-2 inline-block">LIVE</span>
                  <h3 className="font-oswald text-2xl font-bold text-white">{filteredParties[0].movie.title}</h3>
                  <p className="font-mono text-[12px] text-[#8B95A8] mt-1">
                    👑 {filteredParties[0].host.name} • 👥 {filteredParties[0].participants.length} участников
                  </p>
                </div>
                <div className="absolute bottom-6 right-6">
                  <button className="bg-[#FF8C00] hover:bg-[#FF9F2E] text-white font-mono text-[13px] font-semibold px-5 py-2.5 rounded-2xl transition-colors">
                    Войти
                  </button>
                </div>
              </div>
            )}

            {/* Room cards */}
            {filteredParties.length > 1 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredParties.slice(1).map((party) => (
                  <div
                    key={party.id}
                    className="bg-[#1A2236] rounded-[20px] overflow-hidden hover:ring-1 hover:ring-[#FF8400]/30 transition-all group"
                  >
                    <div className="relative aspect-video bg-[#0D1420]">
                      {party.movie.poster ? (
                        <Image
                          src={party.movie.poster}
                          alt={party.movie.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl bg-gradient-to-br from-[#1E2740] to-[#2A3550]">
                          🎬
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                      <div className="absolute bottom-2 left-3 right-3 flex items-end justify-between">
                        <p className="font-mono text-[13px] font-semibold text-white truncate">{party.movie.title}</p>
                      </div>
                      <div className="absolute top-2 right-2 flex gap-1">
                        <span className={`font-mono text-[10px] px-2 py-0.5 rounded-lg ${party.isPublic ? "bg-green-500" : "bg-red-500"} text-white`}>
                          {party.isPublic ? "🔓 Открытая" : "🔒 Закрытая"}
                        </span>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="flex items-center gap-2 mb-3">
                        {party.host.avatar ? (
                          <Image src={party.host.avatar} alt={party.host.name || ""} width={20} height={20} className="rounded-full" />
                        ) : (
                          <div className="w-5 h-5 bg-[#FF8C00] rounded-full flex items-center justify-center text-[10px] text-white font-bold">
                            {party.host.name?.[0] || "?"}
                          </div>
                        )}
                        <span className="font-mono text-[12px] text-[#8B95A8]">{party.host.name}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[11px] text-[#5A6478]">
                          👥 {party.participants.length}/{party.maxUsers}
                        </span>
                        <button
                          onClick={() => handleJoinParty(party)}
                          disabled={isJoining || party.participants.length >= party.maxUsers}
                          className="bg-[#FF8C00] hover:bg-[#FF9F2E] disabled:opacity-40 text-white font-mono text-[11px] font-semibold px-4 py-1.5 rounded-lg transition-colors"
                        >
                          {party.participants.length >= party.maxUsers ? "Полна" : "Войти"}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredParties.length === 0 ? (
              <div className="text-center py-16 bg-[#1A2236] rounded-[20px]">
                <div className="text-4xl mb-3">😔</div>
                <p className="font-mono text-[13px] text-[#5A6478] mb-4">Пока нет активных комнат</p>
                {isAuthenticated && (
                  <Link href="/party/create">
                    <button className="bg-[#FF8C00] hover:bg-[#FF9F2E] text-white font-mono text-[13px] font-semibold px-6 py-3 rounded-2xl transition-colors">
                      Создать первую комнату
                    </button>
                  </Link>
                )}
              </div>
            ) : null}

            {/* CTA Banner */}
            <div className="mt-8 relative h-[180px] rounded-[20px] overflow-hidden bg-[#1A2236]">
              <div className="absolute inset-0 bg-gradient-to-r from-[#FF8C00]/20 to-transparent" />
              <div className="relative h-full flex items-center justify-between px-8">
                <div>
                  <h3 className="font-oswald text-2xl font-bold text-white mb-2">Создайте свою комнату</h3>
                  <p className="font-mono text-[12px] text-[#8B95A8] max-w-md">
                    Приглашайте друзей, выбирайте фильм и смотрите вместе в реальном времени с синхронизацией и чатом.
                  </p>
                </div>
                {isAuthenticated ? (
                  <Link href="/party/create">
                    <button className="flex items-center gap-2 bg-[#FF8C00] hover:bg-[#FF9F2E] text-white font-mono text-[13px] font-semibold px-6 py-3 rounded-2xl transition-colors">
                      + Создать комнату
                    </button>
                  </Link>
                ) : (
                  <Link href="/auth/signin">
                    <button className="bg-[#FF8C00] hover:bg-[#FF9F2E] text-white font-mono text-[13px] font-semibold px-6 py-3 rounded-2xl transition-colors">
                      Войти в аккаунт
                    </button>
                  </Link>
                )}
              </div>
            </div>
          </>
        )}

        {activeTab === "my" && (
          <>
            {myParties.length === 0 ? (
              <div className="text-center py-16 bg-[#1A2236] rounded-[20px]">
                <div className="text-4xl mb-3">🎬</div>
                <p className="font-mono text-[13px] text-[#5A6478]">У вас пока нет комнат</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {myParties.map((party) => (
                  <Link key={party.id} href={`/party/${party.code}`}>
                    <div className="bg-[#1A2236] rounded-[20px] overflow-hidden hover:ring-1 hover:ring-[#FF8400]/30 transition-all group">
                      <div className="relative aspect-video bg-[#0D1420]">
                        {party.movie.poster ? (
                          <Image src={party.movie.poster} alt={party.movie.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-[#1E2740] to-[#2A3550] flex items-center justify-center text-4xl">🎬</div>
                        )}
                        <div className="absolute bottom-2 left-3">
                          <span className="bg-black/70 backdrop-blur-sm px-2 py-1 rounded font-mono text-[#FF8C00] text-[11px] font-bold">{party.code}</span>
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-mono text-[13px] font-semibold text-white group-hover:text-[#FF8400] transition-colors truncate">{party.name || party.movie.title}</h3>
                        <p className="font-mono text-[11px] text-[#5A6478] mt-1">👥 {party.participants.length} участников</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === "ended" && (
          <div className="text-center py-16 bg-[#1A2236] rounded-[20px]">
            <div className="text-4xl mb-3">📋</div>
            <p className="font-mono text-[13px] text-[#5A6478]">Завершённых комнат пока нет</p>
          </div>
        )}
      </div>

      {/* Password Modal */}
      {selectedParty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-[#1A2236] rounded-2xl p-6 w-full max-w-md border border-[#2A3550]">
            <h3 className="font-oswald text-xl font-bold text-white mb-4">🔒 Закрытая комната</h3>
            <p className="font-mono text-[13px] text-[#8B95A8] mb-4">
              Комната <span className="text-[#FF8C00] font-bold">{selectedParty.code}</span> защищена паролем
            </p>

            <form onSubmit={handleJoinPrivate}>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Введите пароль"
                className="w-full h-11 bg-[#0D1420] rounded-2xl px-4 font-mono text-[13px] text-white placeholder-[#5A6478] border border-[#2A3550] outline-none focus:ring-1 focus:ring-[#FF8400]/50 mb-4"
                autoFocus
              />

              {error && <p className="font-mono text-[12px] text-red-400 mb-4">{error}</p>}

              <div className="flex gap-3">
                <button
                  type="button"
                  className="flex-1 h-11 bg-[#2A3550] hover:bg-[#3A4560] text-white font-mono text-[13px] font-semibold rounded-2xl transition-colors"
                  onClick={() => { setSelectedParty(null); setPassword(""); setError(""); }}
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={isJoining || !password}
                  className="flex-1 h-11 bg-[#FF8C00] hover:bg-[#FF9F2E] disabled:opacity-40 text-white font-mono text-[13px] font-semibold rounded-2xl transition-colors"
                >
                  {isJoining ? "Вход..." : "Войти"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
