"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ProxiedImage } from "@/components/ui/ProxiedImage";

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

function EmptyRoomsGraphic({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 160 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <rect
        x="12"
        y="22"
        width="136"
        height="62"
        rx="8"
        stroke="currentColor"
        strokeWidth="1.2"
        className="text-white/12"
      />
      <circle cx="52" cy="53" r="10" className="text-white/10" stroke="currentColor" strokeWidth="1.2" />
      <path
        d="M76 44h48M76 54h36M76 64h44"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        className="text-white/15"
      />
      <path
        d="M118 36l8 8-8 8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        className="text-red-500/40"
      />
    </svg>
  );
}

export function PartyListClient(props: PartyListClientProps) {
  const { parties, myParties, isAuthenticated } = props;
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
    { id: "active" as const, label: "Активные", count: publicParties.length },
    { id: "my" as const, label: "Мои комнаты", count: myParties.length },
    { id: "ended" as const, label: "Завершённые", count: 0 },
  ];

  const primaryCtaClass =
    "inline-flex items-center justify-center gap-2 rounded-2xl bg-[#e50914] px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-red-950/30 transition hover:bg-[#f61212] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/40";

  const secondaryGhost =
    "inline-flex items-center justify-center rounded-xl border border-white/[0.12] bg-white/[0.04] px-4 py-2 text-xs font-semibold text-white/80 transition hover:border-white/20 hover:bg-white/[0.08]";

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0b0f14] pb-20 pt-6 sm:pt-10">
      <div
        className="pointer-events-none absolute inset-0 opacity-100"
        aria-hidden
        style={{
          background:
            "radial-gradient(ellipse 90% 55% at 50% -25%, rgba(229,9,20,0.14), transparent 55%), radial-gradient(ellipse 55% 45% at 100% 0%, rgba(229,9,20,0.06), transparent 50%)",
        }}
      />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.2)_0%,transparent_35%)]" />

      <div className="relative mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">
        {/* Hero */}
        <header className="mb-10 flex flex-col gap-6 border-b border-white/[0.07] pb-10 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="mb-2 font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-red-400/80">
              Комнаты
            </p>
            <h1 className="font-oswald text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-[3.25rem] lg:leading-[1.05]">
              Совместный просмотр
            </h1>
            <p className="mt-4 max-w-lg text-sm leading-relaxed text-white/50 sm:text-[15px]">
              Одна комната, один фильм, синхронизация и чат. Создайте комнату и отправьте гостям шестизначный код.
            </p>
          </div>
          {isAuthenticated ? (
            <Link href="/party/create" className="shrink-0">
              <span className={primaryCtaClass}>Создать комнату</span>
            </Link>
          ) : (
            <Link href="/auth/signin" className="shrink-0">
              <span className={primaryCtaClass}>Войти, чтобы создать</span>
            </Link>
          )}
        </header>

        {/* Tabs — underline, горизонтальный скролл на узких экранах */}
        <div
          className="mb-8 flex gap-1 overflow-x-auto border-b border-white/[0.08] pb-px [-ms-overflow-style:none] [scrollbar-width:none] sm:gap-2 [&::-webkit-scrollbar]:hidden"
          role="tablist"
          aria-label="Разделы"
        >
          {tabs.map((tab) => {
            const on = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={on}
                onClick={() => setActiveTab(tab.id)}
                className={`relative shrink-0 px-3 pb-3 pt-2 font-mono text-[13px] font-medium transition-colors sm:px-5 ${
                  on ? "text-white" : "text-white/45 hover:text-white/75"
                }`}
              >
                <span className="flex items-center gap-2">
                  {tab.label}
                  <span
                    className={`rounded-md px-1.5 py-0.5 text-[10px] font-semibold tabular-nums ${
                      on ? "bg-white/14 text-white" : "bg-white/[0.06] text-white/35"
                    }`}
                  >
                    {tab.count}
                  </span>
                </span>
                {on ? (
                  <span className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-red-500 sm:left-4 sm:right-4" />
                ) : null}
              </button>
            );
          })}
        </div>

        {activeTab === "active" && (
          <>
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-stretch sm:justify-between">
              <div className="relative min-w-0 flex-1">
                <svg
                  className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/30"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                  aria-hidden
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Поиск по названию фильма…"
                  className="h-12 w-full rounded-2xl border border-white/[0.08] bg-[#121821]/90 pl-12 pr-4 text-sm text-white shadow-inner shadow-black/20 backdrop-blur-sm placeholder:text-white/30 focus:border-red-500/35 focus:outline-none focus:ring-1 focus:ring-red-500/20"
                />
              </div>
              <div className="flex shrink-0 items-center justify-between gap-6 rounded-2xl border border-white/[0.08] bg-[#121821]/60 px-5 py-3 sm:flex-col sm:items-end sm:justify-center sm:py-4">
                <div className="text-right">
                  <p className="font-mono text-[10px] uppercase tracking-wider text-white/35">В каталоге</p>
                  <p className="font-oswald text-2xl font-semibold tabular-nums text-white">{filteredParties.length}</p>
                </div>
              </div>
            </div>

            {/* Вход по коду */}
            <div className="mb-10 rounded-2xl border border-white/[0.08] bg-gradient-to-br from-[#121821]/95 to-[#0d1420]/95 p-5 shadow-xl shadow-black/20 sm:p-6">
              <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-white/40">
                  Вход по коду
                </p>
                <span className="font-mono text-[11px] text-white/30">6 символов, латиница и цифры</span>
              </div>
              <form onSubmit={handleJoinByCode} className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <input
                  type="text"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="КОД"
                  maxLength={6}
                  autoComplete="off"
                  className="h-12 w-full rounded-xl border border-white/[0.1] bg-[#0b0f14]/80 px-4 font-mono text-sm font-semibold uppercase tracking-[0.4em] text-white placeholder:text-white/20 focus:border-red-500/40 focus:outline-none focus:ring-1 focus:ring-red-500/20 sm:max-w-[220px] sm:tracking-[0.5em]"
                />
                <button
                  type="submit"
                  disabled={!joinCode.trim()}
                  className="h-12 shrink-0 rounded-xl bg-[#e50914] px-8 text-sm font-semibold text-white shadow-md shadow-red-950/25 transition hover:bg-[#f61212] disabled:cursor-not-allowed disabled:opacity-35"
                >
                  Войти в комнату
                </button>
              </form>
            </div>

            {filteredParties.length > 0 && (
              <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredParties.map((party) => (
                  <article
                    key={party.id}
                    className="group flex flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-[#121821]/90 shadow-lg shadow-black/30 transition hover:-translate-y-0.5 hover:border-red-500/20 hover:shadow-xl hover:shadow-black/40"
                  >
                    <div className="relative aspect-[2/3] bg-[#0d0d0d]">
                      {party.movie.poster ? (
                        <ProxiedImage
                          src={party.movie.poster}
                          alt={party.movie.title}
                          fill
                          className="object-cover transition duration-500 group-hover:scale-[1.03]"
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#1a1f28] to-[#0b0f14] font-mono text-[11px] text-white/25">
                          Нет постера
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/88 via-black/25 to-transparent opacity-95" />
                      <div className="absolute left-3 right-3 top-3 flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 rounded-md border border-emerald-500/25 bg-emerald-950/50 px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wide text-emerald-300/95">
                          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.7)]" />
                          Эфир
                        </span>
                        <span
                          className={`rounded-md border px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wide ${
                            party.isPublic
                              ? "border-white/10 bg-black/45 text-white/80"
                              : "border-red-500/25 bg-red-950/40 text-red-200/90"
                          }`}
                        >
                          {party.isPublic ? "Открытая" : "По паролю"}
                        </span>
                        <span className="ml-auto rounded-md bg-black/60 px-2 py-0.5 font-mono text-[10px] font-bold text-red-200/95 backdrop-blur-sm">
                          {party.code}
                        </span>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 p-3">
                        <p className="line-clamp-2 font-oswald text-base font-semibold leading-snug text-white drop-shadow-md">
                          {party.movie.title}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-1 flex-col justify-between gap-3 border-t border-white/[0.06] p-4">
                      <div className="flex items-center gap-2">
                        {party.host.avatar ? (
                          <ProxiedImage
                            src={party.host.avatar}
                            alt=""
                            width={24}
                            height={24}
                            className="rounded-full object-cover ring-2 ring-white/10"
                          />
                        ) : (
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-600 text-[11px] font-bold text-white">
                            {party.host.name?.[0] || "?"}
                          </div>
                        )}
                        <span className="truncate font-mono text-[12px] text-white/50">{party.host.name}</span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-[11px] tabular-nums text-white/35">
                          {party.participants.length}/{party.maxUsers}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleJoinParty(party)}
                          disabled={isJoining || party.participants.length >= party.maxUsers}
                          className="rounded-xl border border-white/[0.1] bg-white/[0.06] px-4 py-2 text-xs font-semibold text-white transition hover:border-red-500/40 hover:bg-[#e50914] disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          {party.participants.length >= party.maxUsers ? "Комната полна" : "Войти"}
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}

            {filteredParties.length === 0 ? (
              <div className="mb-10 flex flex-col items-center rounded-3xl border border-dashed border-white/[0.12] bg-[#121821]/40 px-6 py-16 text-center sm:py-20">
                <EmptyRoomsGraphic className="mb-6 h-24 w-auto text-white/20 sm:h-28" />
                <h3 className="font-oswald text-2xl font-semibold text-white">Пока никто не в эфире</h3>
                <p className="mt-2 max-w-md font-mono text-[13px] text-white/40">
                  Создайте комнату — она появится здесь, и друзья смогут войти по коду.
                </p>
                {isAuthenticated && (
                  <Link href="/party/create" className="mt-8">
                    <span className={primaryCtaClass}>Создать первую комнату</span>
                  </Link>
                )}
              </div>
            ) : null}

            {/* CTA */}
            <aside className="overflow-hidden rounded-3xl border border-white/[0.1] bg-gradient-to-br from-[#161c26] via-[#121821] to-[#0b0f14] p-[1px] shadow-2xl shadow-black/40">
              <div className="rounded-[22px] bg-[#0f141c]/90 p-6 sm:flex sm:items-center sm:justify-between sm:gap-8 sm:p-8">
                <div className="max-w-lg">
                  <h3 className="font-oswald text-2xl font-bold text-white sm:text-3xl">Свой показ за пару кликов</h3>
                  <p className="mt-2 font-mono text-[13px] leading-relaxed text-white/45">
                    Выберите фильм из каталога, получите код и отправьте ссылку. Синхронизация и чат уже внутри комнаты.
                  </p>
                </div>
                <div className="mt-6 flex shrink-0 flex-col gap-3 sm:mt-0 sm:items-end">
                  {isAuthenticated ? (
                    <Link href="/party/create">
                      <span className={primaryCtaClass}>Новая комната</span>
                    </Link>
                  ) : (
                    <Link href="/auth/signin">
                      <span className={primaryCtaClass}>Войти и создать</span>
                    </Link>
                  )}
                  <Link href="/movies" className={`${secondaryGhost} w-full sm:w-auto`}>
                    К каталогу фильмов
                  </Link>
                </div>
              </div>
            </aside>
          </>
        )}

        {activeTab === "my" && (
          <div className="pb-4">
            {myParties.length === 0 ? (
              <div className="flex flex-col items-center rounded-3xl border border-white/[0.08] bg-[#121821]/50 px-6 py-16 text-center sm:py-20">
                <EmptyRoomsGraphic className="mb-6 h-20 w-auto opacity-30" />
                <h3 className="font-oswald text-xl font-semibold text-white">У вас ещё нет комнат</h3>
                <p className="mt-2 max-w-sm font-mono text-[13px] text-white/40">
                  Созданные вами комнаты появятся в этом разделе.
                </p>
                {isAuthenticated && (
                  <Link href="/party/create" className="mt-8">
                    <span className={primaryCtaClass}>Создать комнату</span>
                  </Link>
                )}
              </div>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {myParties.map((party) => (
                  <Link key={party.id} href={`/party/${party.code}`} className="group block">
                    <article className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#121821]/80 transition hover:-translate-y-0.5 hover:border-red-500/25 hover:shadow-xl hover:shadow-black/40">
                      <div className="relative aspect-[2/3] bg-[#0d0d0d]">
                        {party.movie.poster ? (
                          <ProxiedImage
                            src={party.movie.poster}
                            alt=""
                            fill
                            className="object-cover transition duration-500 group-hover:scale-[1.03]"
                            sizes="(max-width: 768px) 50vw, 25vw"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center font-mono text-[11px] text-white/25">
                            Нет постера
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                        <div className="absolute bottom-3 left-3 right-3">
                          <span className="inline-block rounded-md bg-black/60 px-2 py-1 font-mono text-[11px] font-bold text-red-200/90 backdrop-blur-sm">
                            {party.code}
                          </span>
                          <h3 className="mt-2 line-clamp-2 font-oswald text-lg font-semibold text-white">
                            {party.name || party.movie.title}
                          </h3>
                        </div>
                      </div>
                      <div className="border-t border-white/[0.06] px-4 py-3">
                        <p className="font-mono text-[11px] text-white/40">
                          {party.participants.length}{" "}
                          {party.participants.length === 1 ? "участник" : "участников"}
                        </p>
                      </div>
                    </article>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "ended" && (
          <div className="flex flex-col items-center rounded-3xl border border-white/[0.08] bg-[#121821]/40 px-6 py-16 text-center">
            <EmptyRoomsGraphic className="mb-6 h-20 w-auto opacity-25" />
            <h3 className="font-oswald text-xl font-semibold text-white">История завершённых комнат</h3>
            <p className="mt-2 max-w-md font-mono text-[13px] text-white/40">
              Здесь появятся прошедшие сеансы, когда мы добавим сохранение архива.
            </p>
          </div>
        )}
      </div>

      {error && activeTab === "active" ? (
        <div className="fixed bottom-6 left-1/2 z-40 max-w-md -translate-x-1/2 px-4">
          <div className="rounded-xl border border-red-500/30 bg-red-950/90 px-4 py-3 font-mono text-[12px] text-red-100 shadow-xl backdrop-blur-md">
            {error}
            <button
              type="button"
              className="ml-3 text-red-300 underline-offset-2 hover:underline"
              onClick={() => setError("")}
            >
              Закрыть
            </button>
          </div>
        </div>
      ) : null}

      {selectedParty && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          aria-labelledby="party-password-title"
        >
          <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/[0.12] bg-[#121821] shadow-2xl">
            <button
              type="button"
              className="absolute right-4 top-4 rounded-lg p-1 text-white/40 transition hover:bg-white/10 hover:text-white"
              onClick={() => {
                setSelectedParty(null);
                setPassword("");
                setError("");
              }}
              aria-label="Закрыть"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="border-b border-white/[0.06] px-6 pb-4 pt-6 sm:px-8">
              <p className="font-mono text-[10px] font-semibold uppercase tracking-wider text-red-400/85">
                Закрытая комната
              </p>
              <h3 id="party-password-title" className="mt-1 font-oswald text-2xl font-bold text-white">
                Код {selectedParty.code}
              </h3>
              <p className="mt-2 font-mono text-[13px] text-white/45">Введите пароль, чтобы войти.</p>
            </div>
            <form onSubmit={handleJoinPrivate} className="space-y-4 px-6 py-6 sm:px-8 sm:pb-8">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Пароль"
                className="h-12 w-full rounded-xl border border-white/[0.1] bg-[#0b0f14] px-4 font-mono text-sm text-white outline-none placeholder:text-white/25 focus:border-red-500/40 focus:ring-1 focus:ring-red-500/20"
                autoFocus
              />
              {error ? <p className="font-mono text-[12px] text-red-400">{error}</p> : null}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  className="h-12 flex-1 rounded-xl border border-white/[0.12] font-mono text-sm font-semibold text-white/80 transition hover:bg-white/[0.06]"
                  onClick={() => {
                    setSelectedParty(null);
                    setPassword("");
                    setError("");
                  }}
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={isJoining || !password}
                  className="h-12 flex-1 rounded-xl bg-[#e50914] font-mono text-sm font-semibold text-white transition hover:bg-[#f61212] disabled:opacity-40"
                >
                  {isJoining ? "Вход…" : "Войти"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
