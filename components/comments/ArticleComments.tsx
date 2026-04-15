"use client";

import { useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

interface Comment {
  id: string;
  content: string;
  createdAt: Date;
  user: {
    id: string;
    name: string | null;
    avatar: string | null;
  };
  replies?: Comment[];
}

interface ArticleCommentsProps {
  articleId: string;
  initialComments: Comment[];
}

export function ArticleComments({ articleId, initialComments }: ArticleCommentsProps) {
  const { data: session } = useSession();
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session || !newComment.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/articles/${articleId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newComment }),
      });

      if (res.ok) {
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const data = await res.json();
          setComments((prev) => [data.comment, ...prev]);
        }
        setNewComment("");
      }
    } catch (err) {
      console.error("Comment error:", err);
    } finally {
      setIsSubmitting(false);
    }
  }, [session, newComment, articleId]);

  const handleReply = useCallback(async (parentId: string) => {
    if (!session || !replyText.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/articles/${articleId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: replyText, parentId }),
      });

      if (res.ok) {
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const data = await res.json();
          setComments((prev) =>
            prev.map((c) =>
              c.id === parentId
                ? { ...c, replies: [...(c.replies || []), data.comment] }
                : c
            )
          );
        }
        setReplyText("");
        setReplyingTo(null);
      }
    } catch (err) {
      console.error("Reply error:", err);
    } finally {
      setIsSubmitting(false);
    }
  }, [session, replyText, articleId]);

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold text-white mb-6">💬 Комментарии ({comments.length})</h2>

      {/* Форма комментария */}
      {session ? (
        <form onSubmit={handleSubmit} className="mb-8">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Напишите комментарий..."
            rows={4}
            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500 mb-3"
          />
          <Button type="submit" disabled={isSubmitting || !newComment.trim()}>
            {isSubmitting ? "Отправка..." : "Отправить"}
          </Button>
        </form>
      ) : (
        <div className="mb-8 p-4 bg-slate-800/50 rounded-lg border border-slate-700 text-center">
          <p className="text-slate-400 mb-2">Войдите, чтобы оставить комментарий</p>
          <Link href="/auth/signin">
            <Button>Войти</Button>
          </Link>
        </div>
      )}

      {/* Список комментариев */}
      <div className="space-y-6">
        {comments.length === 0 ? (
          <p className="text-slate-500 text-center py-8">Пока нет комментариев. Будьте первым!</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
              <div className="flex gap-3">
                {comment.user.avatar ? (
                  <Image
                    src={comment.user.avatar}
                    alt={comment.user.name || ""}
                    width={40}
                    height={40}
                    className="rounded-full flex-shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 bg-slate-600 rounded-full flex items-center justify-center text-white flex-shrink-0">
                    {comment.user.name?.[0] || "?"}
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-white font-medium">{comment.user.name}</span>
                    <span className="text-slate-500 text-sm">
                      {new Date(comment.createdAt).toLocaleDateString("ru", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <p className="text-slate-300 whitespace-pre-wrap">{comment.content}</p>

                  {/* Кнопка ответа */}
                  {session && (
                    <button
                      onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                      className="text-amber-400 hover:text-amber-300 text-sm mt-2"
                    >
                      {replyingTo === comment.id ? "Отмена" : "Ответить"}
                    </button>
                  )}

                  {/* Форма ответа */}
                  {replyingTo === comment.id && (
                    <div className="mt-3">
                      <textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Напишите ответ..."
                        rows={2}
                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500 mb-2 text-sm"
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleReply(comment.id)}
                          disabled={isSubmitting || !replyText.trim()}
                        >
                          Отправить
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => {
                            setReplyingTo(null);
                            setReplyText("");
                          }}
                        >
                          Отмена
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Ответы */}
                  {comment.replies && comment.replies.length > 0 && (
                    <div className="mt-4 ml-4 space-y-3 border-l-2 border-slate-700 pl-4">
                      {comment.replies.map((reply) => (
                        <div key={reply.id} className="flex gap-2">
                          {reply.user.avatar ? (
                            <Image
                              src={reply.user.avatar}
                              alt={reply.user.name || ""}
                              width={32}
                              height={32}
                              className="rounded-full flex-shrink-0"
                            />
                          ) : (
                            <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center text-white text-xs flex-shrink-0">
                              {reply.user.name?.[0] || "?"}
                            </div>
                          )}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-white text-sm font-medium">{reply.user.name}</span>
                              <span className="text-slate-500 text-xs">
                                {new Date(reply.createdAt).toLocaleDateString("ru")}
                              </span>
                            </div>
                            <p className="text-slate-300 text-sm">{reply.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

