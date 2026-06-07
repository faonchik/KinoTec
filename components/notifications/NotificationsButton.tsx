"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  link: string | null;
  read: boolean;
  createdAt: string;
  series?: {
    id: string;
    title: string;
    poster: string | null;
  };
}

export function NotificationsButton() {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (session) {
      fetchNotifications();
      // Обновляем каждые 30 секунд
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [session]);

  const fetchNotifications = async () => {
    if (!session) return;
    
    try {
      const res = await fetch("/api/notifications?unread=true&limit=10");
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Response is not JSON");
      }
      const data = await res.json();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const markAsRead = async (notificationIds: string[]) => {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationIds }),
      });
      fetchNotifications();
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  const markAllAsRead = async () => {
    setLoading(true);
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAllAsRead: true }),
      });
      fetchNotifications();
    } catch (error) {
      console.error("Error marking all as read:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!session) return null;

  return (
    <div className="relative">
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen && unreadCount > 0) {
            // Помечаем все как прочитанные при открытии
            markAllAsRead();
          }
        }}
        className="relative p-2 text-slate-400 hover:text-white transition-colors"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50 max-h-[500px] overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-700 flex items-center justify-between">
              <h3 className="font-semibold text-white">Уведомления</h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  disabled={loading}
                  className="text-sm text-amber-400 hover:text-amber-300 transition-colors disabled:opacity-50"
                >
                  Прочитать все
                </button>
              )}
            </div>

            <div className="overflow-y-auto flex-1">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-slate-400">
                  Нет уведомлений
                </div>
              ) : (
                <div className="divide-y divide-slate-700">
                  {notifications.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onMarkAsRead={() => markAsRead([notification.id])}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="p-3 border-t border-slate-700 text-center">
              <Link
                href="/profile/notifications"
                className="text-sm text-amber-400 hover:text-amber-300 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Все уведомления
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function NotificationItem({
  notification,
  onMarkAsRead,
}: {
  notification: Notification;
  onMarkAsRead: () => void;
}) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return "только что";
    if (minutes < 60) return `${minutes} мин назад`;
    if (hours < 24) return `${hours} ч назад`;
    if (days < 7) return `${days} дн назад`;
    return date.toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
  };

  const getIcon = () => {
    switch (notification.type) {
      case "NEW_SEASON":
        return "📺";
      case "NEW_EPISODE":
        return "🎬";
      case "NEW_RELEASE":
        return "🎉";
      case "REVIEW_APPROVED":
        return "✅";
      default:
        return "🔔";
    }
  };

  const content = (
    <div className={`p-4 hover:bg-slate-700/50 transition-colors ${!notification.read ? "bg-slate-700/30" : ""}`}>
      <div className="flex gap-3">
        {notification.series?.poster ? (
          <Image
            src={notification.series.poster}
            alt={notification.series.title}
            width={48}
            height={72}
            className="w-12 h-16 rounded object-cover flex-shrink-0"
          />
        ) : (
          <div className="w-12 h-16 rounded bg-slate-700 flex items-center justify-center text-2xl flex-shrink-0">
            {getIcon()}
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h4 className="font-semibold text-white text-sm">{notification.title}</h4>
            {!notification.read && (
              <div className="w-2 h-2 bg-amber-400 rounded-full flex-shrink-0 mt-1" />
            )}
          </div>
          <p className="text-slate-300 text-sm mb-1">{notification.message}</p>
          <span className="text-slate-500 text-xs">{formatDate(notification.createdAt)}</span>
        </div>
      </div>
    </div>
  );

  if (notification.link) {
    return (
      <Link
        href={notification.link}
        onClick={onMarkAsRead}
      >
        {content}
      </Link>
    );
  }

  return <div onClick={onMarkAsRead}>{content}</div>;
}

