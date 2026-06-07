"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { MovieEmbedPlayer } from "@/components/player/MovieEmbedPlayer";

interface User {
  id: string;
  name: string | null;
  avatar: string | null;
}

interface Message {
  id: string;
  content: string;
  createdAt: Date;
  user: User;
}

interface Party {
  id: string;
  code: string;
  isPlaying: boolean;
  currentTime: number;
  movie: {
    id: string;
    title: string;
    poster: string | null;
    originalTitle: string | null;
    tmdbId: string | null;
    kinopoiskId: string | null;
  };
  host: User;
  participants: Array<{ user: User }>;
  messages: Message[];
}

interface PartyClientProps {
  party: Party;
  embedSrc: string | null;
  currentUserId: string;
  isHost: boolean;
}

export function PartyClient({ party, embedSrc, currentUserId }: PartyClientProps) {
  const [messages, setMessages] = useState<Message[]>(party.messages);
  const [newMessage, setNewMessage] = useState("");
  const [participants, setParticipants] = useState(party.participants);
  const [isSending, setIsSending] = useState(false);
  const [copied, setCopied] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const lastMessageCountRef = useRef(messages.length);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Прокручиваем только при появлении новых сообщений
  useEffect(() => {
    if (messages.length > lastMessageCountRef.current) {
      scrollToBottom();
    }
    lastMessageCountRef.current = messages.length;
  }, [messages]);

  // Polling для обновления чата и участников
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/party/${party.code}/status`);
        if (res.ok) {
          const data = await res.json();
          // Обновляем только если есть изменения
          if (data.messages?.length !== messages.length) {
            setMessages(data.messages || []);
          }
          setParticipants(data.participants || []);
        }
      } catch {
        // Ignore errors
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [party.code, messages.length]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isSending) return;

    setIsSending(true);

    try {
      const res = await fetch(`/api/party/${party.code}/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newMessage }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [...prev, data.message]);
        setNewMessage("");
      }
    } catch (error) {
      console.error("Send message error:", error);
    } finally {
      setIsSending(false);
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(party.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareLink = () => {
    const url = `${window.location.origin}/party/${party.code}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const leaveParty = async () => {
    if (!confirm("Вы уверены, что хотите покинуть комнату?")) return;
    
    try {
      const res = await fetch(`/api/party/${party.code}/leave`, {
        method: "POST",
      });
      
      if (res.ok) {
        window.location.href = "/party";
      }
    } catch (error) {
      console.error("Leave party error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="container mx-auto px-4 py-4">
        {/* Заголовок */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-white">{party.movie.title}</h1>
            <p className="text-slate-400 text-sm">Watch Party</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="bg-slate-800 px-4 py-2 rounded-lg">
              <span className="text-slate-400 text-sm">Код: </span>
              <span className="text-amber-400 font-mono font-bold">{party.code}</span>
            </div>
            <Button variant="secondary" size="sm" onClick={copyCode}>
              {copied ? "Скопировано" : "Копировать"}
            </Button>
            <Button variant="secondary" size="sm" onClick={shareLink}>
              Ссылка
            </Button>
            <Button variant="danger" size="sm" onClick={leaveParty}>
              Выйти
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-[1fr_350px] gap-4">
          {/* Плеер */}
          <div>
            <MovieEmbedPlayer
              src={embedSrc}
              title={party.movie.originalTitle || party.movie.title}
              className="w-full rounded-xl"
            />
          </div>

          {/* Сайдбар */}
          <div className="flex flex-col h-[calc(100vh-200px)]">
            {/* Участники */}
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 mb-4">
              <h3 className="text-white font-semibold mb-3">
                Участники ({participants.length})
              </h3>
              <div className="flex flex-wrap gap-2">
                {participants.map((p) => (
                  <div
                    key={p.user.id}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${
                      p.user.id === party.host.id
                        ? "bg-amber-500/20 text-amber-400"
                        : "bg-slate-700/50 text-slate-300"
                    }`}
                    title={p.user.id === party.host.id ? "Хост" : "Участник"}
                  >
                    {p.user.avatar ? (
                      <Image
                        src={p.user.avatar}
                        alt={p.user.name || ""}
                        width={20}
                        height={20}
                        className="rounded-full"
                      />
                    ) : (
                      <div className="w-5 h-5 bg-slate-600 rounded-full flex items-center justify-center text-xs">
                        {p.user.name?.[0] || "?"}
                      </div>
                    )}
                    <span className="text-sm">{p.user.name}</span>
                    {p.user.id === party.host.id && (
                      <span className="text-[10px] font-semibold uppercase text-amber-400/90">хост</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Чат */}
            <div className="flex-1 bg-slate-800/50 rounded-xl border border-slate-700/50 flex flex-col overflow-hidden">
              <div className="p-3 border-b border-slate-700/50">
                <h3 className="text-white font-semibold">Чат</h3>
              </div>

              {/* Сообщения */}
              <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {messages.length === 0 ? (
                  <p className="text-slate-500 text-center text-sm py-4">
                    Начните общение!
                  </p>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex gap-2 ${
                        msg.user.id === currentUserId ? "flex-row-reverse" : ""
                      }`}
                    >
                      <div className="w-8 h-8 flex-shrink-0">
                        {msg.user.avatar ? (
                          <Image
                            src={msg.user.avatar}
                            alt={msg.user.name || ""}
                            width={32}
                            height={32}
                            className="rounded-full"
                          />
                        ) : (
                          <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center text-xs text-white">
                            {msg.user.name?.[0] || "?"}
                          </div>
                        )}
                      </div>
                      <div
                        className={`max-w-[80%] px-3 py-2 rounded-lg ${
                          msg.user.id === currentUserId
                            ? "bg-amber-500 text-black"
                            : "bg-slate-700 text-white"
                        }`}
                      >
                        {msg.user.id !== currentUserId && (
                          <p className="text-xs text-slate-400 mb-0.5">
                            {msg.user.name}
                          </p>
                        )}
                        <p className="text-sm">{msg.content}</p>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Форма отправки */}
              <form onSubmit={sendMessage} className="p-3 border-t border-slate-700/50">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Сообщение..."
                    className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
                  />
                  <Button type="submit" size="sm" disabled={isSending}>
                    ↑
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

