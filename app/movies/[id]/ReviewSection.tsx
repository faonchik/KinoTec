"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { Rating } from "@/components/ui/Rating";
import { CommentSection } from "@/components/reviews/CommentSection";
import { useTranslations } from "next-intl";

interface Review {
  id: string;
  userId: string;
  content: string;
  createdAt: Date;
  user: {
    id: string;
    name: string | null;
    email: string;
    ratings?: {
      value: number;
    }[];
  };
}

interface ReviewSectionProps {
  movieId: string;
  reviews: Review[];
}

export function ReviewSection({ movieId, reviews }: ReviewSectionProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const t = useTranslations("reviews");
  const tCommon = useTranslations("common");

  const [showForm, setShowForm] = useState(false);
  const [content, setContent] = useState("");
  const [rating, setRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Редактирование отзыва
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [editRating, setEditRating] = useState(0);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editError, setEditError] = useState("");

  const handleEditStart = (review: Review) => {
    setEditingId(review.id);
    setEditContent(review.content);
    setEditRating(review.user.ratings?.[0]?.value || 0);
    setEditError("");
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditContent("");
    setEditRating(0);
    setEditError("");
  };

  const handleUpdate = async (e: React.FormEvent, reviewId: string) => {
    e.preventDefault();
    setEditError("");

    if (!editContent.trim()) {
      setEditError(t("enterText"));
      return;
    }

    if (editContent.length < 10) {
      setEditError(t("minLength"));
      return;
    }

    if (editRating === 0) {
      setEditError(t("selectRating"));
      return;
    }

    setIsUpdating(true);

    try {
      const response = await fetch(`/api/reviews/${reviewId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: editContent, rating: editRating }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || t("errorUpdate"));
      }

      setEditingId(null);
      router.refresh();
    } catch (err) {
      setEditError(err instanceof Error ? err.message : t("errorUpdate"));
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async (reviewId: string) => {
    if (!confirm(t("deleteConfirm"))) return;

    try {
      const response = await fetch(`/api/reviews/${reviewId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || t("errorDelete"));
      }

      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : t("errorDelete"));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!content.trim()) {
      setError(t("enterText"));
      return;
    }

    if (content.length < 10) {
      setError(t("minLength"));
      return;
    }

    if (rating === 0) {
      setError(t("selectRating"));
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
        throw new Error(data.error || t("errorSubmit"));
      }

      setContent("");
      setRating(0);
      setShowForm(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errorSubmit"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasReviewed = reviews.some((r) => r.userId === session?.user?.id);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">
          {t("reviewsCount", { count: reviews.length })}
        </h2>
        {session && !showForm && !hasReviewed && (
          <Button onClick={() => setShowForm(true)}>
            {t("write")}
          </Button>
        )}
      </div>

      {/* Review Form */}
      {session && showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6 mb-8"
        >
          <h3 className="text-lg font-semibold text-white mb-4">{t("yourReview")}</h3>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              {t("yourRating")}
            </label>
            <Rating value={rating} onChange={setRating} size="md" />
          </div>

          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={t("placeholder")}
            rows={5}
            className="mb-4"
          />

          {error && (
            <p className="text-red-400 text-sm mb-4">{error}</p>
          )}

          <div className="flex gap-4">
            <Button type="submit" isLoading={isSubmitting}>
              {tCommon("submit")}
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
              {tCommon("cancel")}
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
          <p className="text-slate-400">{t("noReviews")}</p>
          {session && (
            <Button onClick={() => setShowForm(true)} className="mt-4">
              {t("beFirst")}
            </Button>
          )}
          {!session && (
            <p className="text-slate-500 text-sm mt-2">
              <a href="/auth/signin" className="text-amber-400 hover:underline">
                {tCommon("signIn")}
              </a>
              {t("loginToReviewText")}
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
                      {review.user.name || t("userDefaultName")}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-sm text-slate-400">
                        {new Date(review.createdAt).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                      {review.user.ratings?.[0]?.value && (
                        <span className="text-xs text-amber-400 bg-[#ffb84d]/10 px-2 py-0.5 rounded border border-[#ffb84d]/20 flex items-center gap-1 font-mono">
                          ★ {review.user.ratings[0].value} / 10
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {session?.user?.id === review.userId && !editingId && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditStart(review)}
                      className="text-xs text-slate-400 hover:text-[#ffb84d] transition-colors font-mono"
                    >
                      {t("editShort")}
                    </button>
                    <button
                      onClick={() => handleDelete(review.id)}
                      className="text-xs text-slate-400 hover:text-red-400 transition-colors font-mono"
                    >
                      {t("deleteShort")}
                    </button>
                  </div>
                )}
              </div>

              {editingId === review.id ? (
                <form onSubmit={(e) => handleUpdate(e, review.id)} className="mt-2">
                  <div className="mb-4">
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      {t("yourRating")}
                    </label>
                    <Rating value={editRating} onChange={setEditRating} size="sm" />
                  </div>
                  <Textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    rows={4}
                    className="mb-3"
                  />
                  {editError && <p className="text-red-400 text-xs mb-3">{editError}</p>}
                  <div className="flex gap-2">
                    <Button type="submit" size="sm" isLoading={isUpdating}>
                      {tCommon("save")}
                    </Button>
                    <Button type="button" variant="ghost" size="sm" onClick={handleEditCancel}>
                      {tCommon("cancel")}
                    </Button>
                  </div>
                </form>
              ) : (
                <>
                  <p className="text-slate-300 whitespace-pre-line">{review.content}</p>
                  {/* Комментарии к отзыву */}
                  <CommentSection reviewId={review.id} />
                </>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

