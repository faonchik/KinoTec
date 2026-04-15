"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";

interface Comment {
  id: string;
  content: string;
  createdAt: Date;
  userId: string;
  user: {
    name: string | null;
    email: string;
  };
}

interface CommentSectionProps {
  reviewId: string;
  initialComments?: Comment[];
}

export function CommentSection({ reviewId, initialComments = [] }: CommentSectionProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [showForm, setShowForm] = useState(false);
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!content.trim()) {
      setError("Введите комментарий");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/reviews/${reviewId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: content.trim() }),
      });

      if (!res.ok) {
        throw new Error("Ошибка при отправке комментария");
      }

      const data = await res.json();
      setComments((prev) => [...prev, data.comment]);
      setContent("");
      setShowForm(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-4 pt-4 border-t border-slate-700/50">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-slate-400">
          Комментарии ({comments.length})
        </p>
        {session && !showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="text-sm text-amber-400 hover:text-amber-300"
          >
            Ответить
          </button>
        )}
      </div>

      {/* Форма */}
      {showForm && session && (
        <form onSubmit={handleSubmit} className="mb-4">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Ваш комментарий..."
            rows={2}
            className="mb-2 text-sm"
          />
          {error && <p className="text-red-400 text-xs mb-2">{error}</p>}
          <div className="flex gap-2">
            <Button type="submit" size="sm" isLoading={isSubmitting}>
              Отправить
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setShowForm(false);
                setContent("");
                setError("");
              }}
            >
              Отмена
            </Button>
          </div>
        </form>
      )}

      {/* Список комментариев */}
      {comments.length > 0 && (
        <div className="space-y-3">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-3">
              <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center text-xs text-white flex-shrink-0">
                {comment.user.name?.[0] || comment.user.email[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-white">
                    {comment.user.name || "Пользователь"}
                  </span>
                  <span className="text-xs text-slate-500">
                    {new Date(comment.createdAt).toLocaleDateString("ru-RU")}
                  </span>
                </div>
                <p className="text-sm text-slate-300">{comment.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
