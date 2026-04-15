"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/Button";

interface Collection {
  id: string;
  title: string;
  description: string | null;
  cover: string | null;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  movies: Array<{
    movie: {
      id: string;
      title: string;
      poster: string | null;
    };
  }>;
}

export default function CollectionsPage() {
  const { data: session, status } = useSession();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/auth/signin");
    }
    if (session) {
      fetchCollections();
    }
  }, [session, status]);

  const fetchCollections = async () => {
    try {
      const res = await fetch("/api/collections?userId=" + session?.user?.id);
      const data = await res.json();
      setCollections(data.collections || []);
    } catch (error) {
      console.error("Error fetching collections:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      const res = await fetch("/api/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle.trim(),
          description: newDescription.trim() || null,
          isPublic: false,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setNewTitle("");
        setNewDescription("");
        setIsCreating(false);
        fetchCollections();
      }
    } catch (error) {
      console.error("Error creating collection:", error);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-slate-400">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Мои подборки</h1>
          <p className="text-slate-400">Создавайте и управляйте персональными подборками фильмов</p>
        </div>
        <Button onClick={() => setIsCreating(!isCreating)}>
          {isCreating ? "Отмена" : "+ Создать подборку"}
        </Button>
      </div>

      {isCreating && (
        <form onSubmit={handleCreate} className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 mb-8">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">Название</label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-500"
                placeholder="Например: Лучшие фильмы 2024"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-2">Описание (необязательно)</label>
              <textarea
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-500 resize-none"
                rows={3}
                placeholder="Краткое описание подборки"
              />
            </div>
            <div className="flex gap-3">
              <Button type="submit">Создать</Button>
              <Button type="button" variant="ghost" onClick={() => setIsCreating(false)}>
                Отмена
              </Button>
            </div>
          </div>
        </form>
      )}

      {collections.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">📚</div>
          <h2 className="text-2xl font-bold text-white mb-2">Нет подборок</h2>
          <p className="text-slate-400 mb-6">Создайте свою первую подборку фильмов</p>
          <Button onClick={() => setIsCreating(true)}>Создать подборку</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {collections.map((collection) => (
            <Link
              key={collection.id}
              href={`/collections/${collection.id}`}
              className="group bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden hover:border-amber-500/50 transition-all"
            >
              {collection.cover ? (
                <div className="relative h-48">
                  <Image
                    src={collection.cover}
                    alt={collection.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              ) : collection.movies.length > 0 && collection.movies[0].movie.poster ? (
                <div className="relative h-48">
                  <Image
                    src={collection.movies[0].movie.poster}
                    alt={collection.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              ) : (
                <div className="h-48 bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center">
                  <div className="text-4xl">📚</div>
                </div>
              )}
              
              <div className="p-6">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-xl font-bold text-white group-hover:text-amber-400 transition-colors line-clamp-2">
                    {collection.title}
                  </h3>
                  {collection.isPublic && (
                    <span className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded ml-2 flex-shrink-0">
                      Публичная
                    </span>
                  )}
                </div>
                
                {collection.description && (
                  <p className="text-slate-400 text-sm mb-4 line-clamp-2">{collection.description}</p>
                )}
                
                <div className="flex items-center justify-between text-sm text-slate-500">
                  <span>{collection.movies.length} {collection.movies.length === 1 ? "фильм" : collection.movies.length < 5 ? "фильма" : "фильмов"}</span>
                  <span>{new Date(collection.updatedAt).toLocaleDateString("ru-RU")}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

