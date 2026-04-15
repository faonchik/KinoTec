"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { Rating } from "@/components/ui/Rating";
import { CommentSection } from "@/components/reviews/CommentSection";

interface Review {
  id: string;
  content: string;
  createdAt: Date;
  user: {
    name: string | null;
    email: string;
  };
}

interface ReviewSectionProps {
  movieId: string;
  reviews: Review[];
}

export function ReviewSection({ movieId, reviews }: ReviewSectionProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [content, setContent] = useState("");
  const [rating, setRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!content.trim()) {
      setError("Введите текст отзыва");
      return;
    }

    if (content.length < 10) {
      setError("Отзыв должен содержать минимум 10 символов");
      return;
    }

    if (rating === 0) {
      setError("Выберите рейтинг");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/movies/${movieId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, rating }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Ошибка при отправке отзыва");
      }

      setContent("");
      setRating(0);
      setShowForm(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка при отправке отзыва");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">
          Отзывы ({reviews.length})
        </h2>
        {session && !showForm && (
          <Button onClick={() => setShowForm(true)}>
            Написать отзыв
          </Button>
        )}
      </div>

      {/* Review Form */}
      {session && showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6 mb-8"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Ваш отзыв</h3>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Ваша оценка
            </label>
            <Rating value={rating} onChange={setRating} size="md" />
          </div>

          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Поделитесь своим мнением о фильме..."
            rows={5}
            className="mb-4"
          />

          {error && (
            <p className="text-red-400 text-sm mb-4">{error}</p>
          )}

          <div className="flex gap-4">
            <Button type="submit" isLoading={isSubmitting}>
              Отправить
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setShowForm(false);
                setContent("");
                setRating(0);
                setError("");
              }}
            >
              Отмена
            </Button>
          </div>
        </form>
      )}

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="text-center py-12">
          <svg className="w-16 h-16 mx-auto text-slate-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <p className="text-slate-400">Пока нет отзывов</p>
          {session && (
            <Button onClick={() => setShowForm(true)} className="mt-4">
              Будьте первым!
            </Button>
          )}
          {!session && (
            <p className="text-slate-500 text-sm mt-2">
              <a href="/auth/signin" className="text-amber-400 hover:underline">
                Войдите
              </a>
              , чтобы оставить отзыв
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {reviews.map((review) => (
            <article
              key={review.id}
              className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {review.user.name?.[0] || review.user.email[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-white">
                      {review.user.name || "Пользователь"}
                    </p>
                    <p className="text-sm text-slate-400">
                      {new Date(review.createdAt).toLocaleDateString("ru-RU", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              </div>
              <p className="text-slate-300 whitespace-pre-line">{review.content}</p>
              
              {/* Комментарии к отзыву */}
              <CommentSection reviewId={review.id} />
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

