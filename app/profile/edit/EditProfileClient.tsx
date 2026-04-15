"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AvatarUpload } from "@/components/profile/AvatarUpload";
import { BackgroundUpload } from "@/components/profile/BackgroundUpload";
import { Button } from "@/components/ui/Button";

interface User {
  id: string;
  name: string | null;
  email: string;
  bio: string | null;
  avatar: string | null;
  profileFrame: string | null;
  profileBadge: string | null;
  nameColor: string | null;
  avatarEffect: string | null;
  chatBubble: string | null;
  emojiPack: string | null;
  profileBackground: string | null;
  theme: string | null;
}

interface EditProfileClientProps {
  user: User;
}

export function EditProfileClient({ user: initialUser }: EditProfileClientProps) {
  const router = useRouter();
  const [name, setName] = useState(initialUser.name || "");
  const [bio, setBio] = useState(initialUser.bio || "");
  const [avatar, setAvatar] = useState<string | null>(initialUser.avatar);
  const [background, setBackground] = useState<string | null>(initialUser.profileBackground);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim() || null,
          bio: bio.trim() || null,
        }),
      });

      if (!res.ok) {
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const data = await res.json();
          setMessage({ type: "error", text: data.error || "Ошибка при обновлении профиля" });
        } else {
          setMessage({ type: "error", text: "Ошибка при обновлении профиля" });
        }
        return;
      }

      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const data = await res.json();
        if (data.success) {
          setMessage({ type: "success", text: "Профиль успешно обновлён!" });
          setTimeout(() => {
            router.push("/profile");
            router.refresh();
          }, 1000);
        }
      }
    } catch (error) {
      console.error("Profile update error:", error);
      setMessage({ type: "error", text: "Ошибка сети. Попробуйте позже." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#151C2C]">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-oswald text-3xl font-bold text-white mb-2">Редактирование профиля</h1>
            <p className="font-mono text-[13px] text-[#8B95A8]">Измените информацию о себе</p>
          </div>
          <Link href="/profile">
            <Button variant="secondary">Назад к профилю</Button>
          </Link>
        </div>

        {/* Message */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-xl ${
              message.type === "success"
                ? "bg-green-500/20 text-green-400 border border-green-500/50"
                : "bg-red-500/20 text-red-400 border border-red-500/50"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Background Section */}
          <div className="bg-[#1A2236] rounded-2xl p-6">
            <h2 className="font-oswald text-xl font-bold text-white mb-4">Фон профиля</h2>
            <BackgroundUpload
              currentBackground={background}
              onBackgroundChange={setBackground}
            />
          </div>

          {/* Avatar Section */}
          <div className="bg-[#1A2236] rounded-2xl p-6">
            <h2 className="font-oswald text-xl font-bold text-white mb-4">Аватар</h2>
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0">
                <AvatarUpload
                  currentAvatar={avatar}
                  userName={name || initialUser.email}
                  userEmail={initialUser.email}
                  profileFrame={initialUser.profileFrame}
                  avatarEffect={initialUser.avatarEffect}
                  onAvatarChange={setAvatar}
                />
              </div>
              <div className="flex-1">
                <p className="font-mono text-[13px] text-[#8B95A8]">
                  Загрузите новое изображение для вашего профиля. Рекомендуемый размер: 400x400 пикселей.
                </p>
              </div>
            </div>
          </div>

          {/* Basic Info */}
          <div className="bg-[#1A2236] rounded-2xl p-6">
            <h2 className="font-oswald text-xl font-bold text-white mb-4">Основная информация</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block font-mono text-[13px] text-[#8B95A8] mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={initialUser.email}
                  disabled
                  className="w-full px-4 py-2.5 bg-[#2A3550] border border-[#3A4560] rounded-xl text-white font-mono text-[13px] cursor-not-allowed opacity-60"
                />
                <p className="font-mono text-[11px] text-[#5A6478] mt-1">Email нельзя изменить</p>
              </div>

              <div>
                <label htmlFor="name" className="block font-mono text-[13px] text-[#8B95A8] mb-2">
                  Имя
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={50}
                  placeholder="Введите ваше имя"
                  className="w-full px-4 py-2.5 bg-[#2A3550] border border-[#3A4560] rounded-xl text-white font-mono text-[13px] focus:outline-none focus:border-[#FF8400] transition-colors"
                />
                <p className="font-mono text-[11px] text-[#5A6478] mt-1">
                  {name.length}/50 символов
                </p>
              </div>

              <div>
                <label htmlFor="bio" className="block font-mono text-[13px] text-[#8B95A8] mb-2">
                  О себе
                </label>
                <textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  maxLength={500}
                  rows={5}
                  placeholder="Расскажите о себе..."
                  className="w-full px-4 py-2.5 bg-[#2A3550] border border-[#3A4560] rounded-xl text-white font-mono text-[13px] focus:outline-none focus:border-[#FF8400] transition-colors resize-none"
                />
                <p className="font-mono text-[11px] text-[#5A6478] mt-1">
                  {bio.length}/500 символов
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-4">
            <Link href="/profile">
              <Button variant="secondary" type="button">
                Отмена
              </Button>
            </Link>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Сохранение..." : "Сохранить изменения"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
