"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { Button } from "@/components/ui/Button";

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    email: string;
    avatar: string | null;
  };
  replies: Comment[];
}

interface SeriesCommentsProps {
  seriesId: string;
}

export function SeriesComments({ seriesId }: SeriesCommentsProps) {
  const { data: session } = useSession();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");

  useEffect(() => {
    fetchComments();
  }, [seriesId]);

  const fetchComments = async () => {
    try {
      const res = await fetch(`/api/series/${seriesId}/comments`);
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Response is not JSON");
      }
      const data = await res.json();
      setComments(data.comments || []);
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session || !newComment.trim()) return;

    try {
      const res = await fetch(`/api/series/${seriesId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newComment.trim() }),
      });

      if (res.ok) {
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          // Если ответ содержит JSON, можно его обработать
        }
        setNewComment("");
        fetchComments();
      }
    } catch (error) {
      console.error("Error posting comment:", error);
    }
  };

  const handleReply = async (parentId: string) => {
    if (!session || !replyContent.trim()) return;

    try {
      const res = await fetch(`/api/series/${seriesId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: replyContent.trim(), parentId }),
      });

      if (res.ok) {
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          // Если ответ содержит JSON, можно его обработать
        }
        setReplyContent("");
        setReplyingTo(null);
        fetchComments();
      }
    } catch (error) {
      console.error("Error posting reply:", error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return "только что";
    if (minutes < 60) return `${minutes} ${minutes === 1 ? "минуту" : minutes < 5 ? "минуты" : "минут"} назад`;
    if (hours < 24) return `${hours} ${hours === 1 ? "час" : hours < 5 ? "часа" : "часов"} назад`;
    if (days < 7) return `${days} ${days === 1 ? "день" : "дня"} назад`;
    return date.toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" });
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="text-slate-400">Загрузка комментариев...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Комментарии ({comments.length})</h2>

      {session ? (
        <form onSubmit={handleSubmit} className="space-y-3">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Напишите комментарий..."
            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 resize-none"
            rows={3}
          />
          <div className="flex justify-end">
            <Button type="submit" disabled={!newComment.trim()}>
              Отправить
            </Button>
          </div>
        </form>
      ) : (
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 text-center">
          <p className="text-slate-400 mb-3">Войдите, чтобы оставить комментарий</p>
          <Button href="/auth/signin">Войти</Button>
        </div>
      )}

      <div className="space-y-6">
        {comments.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            Пока нет комментариев. Будьте первым!
          </div>
        ) : (
          comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              seriesId={seriesId}
              session={session}
              onReply={handleReply}
              replyingTo={replyingTo}
              setReplyingTo={setReplyingTo}
              replyContent={replyContent}
              setReplyContent={setReplyContent}
              formatDate={formatDate}
            />
          ))
        )}
      </div>
    </div>
  );
}

function CommentItem({
  comment,
  seriesId,
  session,
  onReply,
  replyingTo,
  setReplyingTo,
  replyContent,
  setReplyContent,
  formatDate,
}: {
  comment: Comment;
  seriesId: string;
  session: any;
  onReply: (parentId: string) => void;
  replyingTo: string | null;
  setReplyingTo: (id: string | null) => void;
  replyContent: string;
  setReplyContent: (content: string) => void;
  formatDate: (date: string) => string;
}) {
  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
      <div className="flex gap-3">
        {comment.user.avatar ? (
          <Image
            src={comment.user.avatar}
            alt={comment.user.name || comment.user.email}
            width={40}
            height={40}
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-slate-400">
            {(comment.user.name || comment.user.email)[0].toUpperCase()}
          </div>
        )}
        
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-white">
              {comment.user.name || comment.user.email.split("@")[0]}
            </span>
            <span className="text-slate-500 text-sm">{formatDate(comment.createdAt)}</span>
          </div>
          
          <p className="text-slate-300 mb-3 whitespace-pre-wrap">{comment.content}</p>

          {session && (
            <button
              onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
              className="text-sm text-slate-400 hover:text-amber-400 transition-colors"
            >
              {replyingTo === comment.id ? "Отмена" : "Ответить"}
            </button>
          )}

          {replyingTo === comment.id && (
            <div className="mt-3 space-y-2">
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Напишите ответ..."
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 resize-none text-sm"
                rows={2}
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => onReply(comment.id)}
                  disabled={!replyContent.trim()}
                >
                  Отправить
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setReplyingTo(null);
                    setReplyContent("");
                  }}
                >
                  Отмена
                </Button>
              </div>
            </div>
          )}

          {comment.replies.length > 0 && (
            <div className="mt-4 ml-4 space-y-4 border-l-2 border-slate-700 pl-4">
              {comment.replies.map((reply) => (
                <div key={reply.id} className="flex gap-3">
                  {reply.user.avatar ? (
                    <Image
                      src={reply.user.avatar}
                      alt={reply.user.name || reply.user.email}
                      width={32}
                      height={32}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-slate-400 text-xs">
                      {(reply.user.name || reply.user.email)[0].toUpperCase()}
                    </div>
                  )}
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-white text-sm">
                        {reply.user.name || reply.user.email.split("@")[0]}
                      </span>
                      <span className="text-slate-500 text-xs">{formatDate(reply.createdAt)}</span>
                    </div>
                    <p className="text-slate-300 text-sm whitespace-pre-wrap">{reply.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

