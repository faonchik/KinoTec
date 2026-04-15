"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { ItemPreview } from "@/components/shop/ItemPreview";

interface ShopItem {
  id: string;
  name: string;
  description: string | null;
  type: string;
  value: string;
  price: number;
  rarity: string;
  preview: string | null;
}

interface ShopClientProps {
  items: ShopItem[];
  userCoins: number;
  purchasedItemIds: string[];
  isAuthenticated: boolean;
}

const TYPE_LABELS: Record<string, { label: string; icon: string; usage: string; previewIcon: string }> = {
  PROFILE_FRAME: { 
    label: "Рамки профиля", 
    icon: "🖼️", 
    usage: "Отображается вокруг аватара в профиле",
    previewIcon: "🖼️"
  },
  PROFILE_BADGE: { 
    label: "Значки", 
    icon: "🏷️", 
    usage: "Показывается рядом с именем в профиле и комментариях",
    previewIcon: "🏷️"
  },
  NAME_COLOR: { 
    label: "Цвета ника", 
    icon: "🎨", 
    usage: "Используется для цвета имени в профиле и комментариях",
    previewIcon: "🎨"
  },
  THEME: { 
    label: "Темы", 
    icon: "🌙", 
    usage: "Меняет цветовую схему всего сайта",
    previewIcon: "🌙"
  },
  AVATAR_EFFECT: { 
    label: "Эффекты аватара", 
    icon: "✨", 
    usage: "Анимированные эффекты вокруг аватара в профиле",
    previewIcon: "✨"
  },
  CHAT_BUBBLE: { 
    label: "Стили чата", 
    icon: "💬", 
    usage: "Кастомизирует стиль сообщений в чатах и комментариях",
    previewIcon: "💬"
  },
  EMOJI_PACK: { 
    label: "Эмодзи", 
    icon: "😀", 
    usage: "Дополнительные эмодзи для использования в комментариях",
    previewIcon: "😀"
  },
  BACKGROUND: { 
    label: "Фоны профиля", 
    icon: "🖼️", 
    usage: "Фоновое изображение на странице профиля",
    previewIcon: "🖼️"
  },
};

const RARITY_COLORS: Record<string, { bg: string; border: string; text: string; glow: string }> = {
  COMMON: { bg: "bg-slate-700", border: "border-slate-600", text: "text-slate-300", glow: "" },
  UNCOMMON: { bg: "bg-green-900/30", border: "border-green-500/50", text: "text-green-400", glow: "shadow-green-500/20" },
  RARE: { bg: "bg-blue-900/30", border: "border-blue-500/50", text: "text-blue-400", glow: "shadow-blue-500/20" },
  EPIC: { bg: "bg-purple-900/30", border: "border-purple-500/50", text: "text-purple-400", glow: "shadow-purple-500/30" },
  LEGENDARY: { bg: "bg-amber-900/30", border: "border-amber-500/50", text: "text-amber-400", glow: "shadow-amber-500/30 shadow-lg" },
};

const RARITY_LABELS: Record<string, string> = {
  COMMON: "Обычный",
  UNCOMMON: "Необычный",
  RARE: "Редкий",
  EPIC: "Эпический",
  LEGENDARY: "Легендарный",
};

export function ShopClient({ items, userCoins, purchasedItemIds, isAuthenticated }: ShopClientProps) {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [isPurchasing, setIsPurchasing] = useState<string | null>(null);
  const [coins, setCoins] = useState(userCoins);

  const types = Array.from(new Set(items.map((i) => i.type)));
  const filteredItems = selectedType ? items.filter((i) => i.type === selectedType) : items;

  const handlePurchase = async (item: ShopItem) => {
    if (!isAuthenticated) {
      router.push("/auth/signin");
      return;
    }

    if (coins < item.price) {
      alert("Недостаточно монет!");
      return;
    }

    setIsPurchasing(item.id);

    try {
      const res = await fetch("/api/shop/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId: item.id }),
      });

      if (res.ok) {
        const data = await res.json();
        setCoins(data.newBalance);
        
        // Автоматически применяем предмет (кроме тем)
        if (item.type !== "THEME") {
          await fetch("/api/user/customization", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ itemId: item.id, equip: true }),
          });
        }
        
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error || "Ошибка покупки");
      }
    } catch {
      alert("Ошибка сети");
    } finally {
      setIsPurchasing(null);
    }
  };

  const handleEquip = async (itemId: string, equip: boolean) => {
    try {
      await fetch("/api/user/customization", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId, equip }),
      });
      router.refresh();
    } catch {
      alert("Ошибка");
    }
  };

  // Группируем по редкости для отображения
  const groupedByRarity = filteredItems.reduce((acc, item) => {
    if (!acc[item.rarity]) acc[item.rarity] = [];
    acc[item.rarity].push(item);
    return acc;
  }, {} as Record<string, ShopItem[]>);

  const rarityOrder = ["COMMON", "UNCOMMON", "RARE", "EPIC", "LEGENDARY"];

  // Если нет товаров, показываем сообщение
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#151C2C] py-8">
        <div className="px-12">
          <h1 className="font-oswald text-4xl font-bold text-white mb-2">🛒 Магазин</h1>
          <p className="font-mono text-[13px] text-[#8B95A8] mb-8">Кастомизируй свой профиль уникальными предметами</p>
          <div className="bg-[#1A2236] rounded-2xl p-8 text-center">
            <p className="font-mono text-[13px] text-[#5A6478]">Товары временно отсутствуют. Загляните позже!</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#151C2C] py-8">
      <div className="px-12">
        {/* Заголовок */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-oswald text-4xl font-bold text-white mb-2">🛒 Магазин</h1>
            <p className="font-mono text-[13px] text-[#8B95A8]">Кастомизируй свой профиль уникальными предметами</p>
          </div>

          {/* Баланс */}
          <div className="bg-[#1E2740] rounded-2xl px-6 py-4 border border-[#FF8400]/30">
            <p className="font-mono text-[12px] text-[#8B95A8]">Ваш баланс</p>
            <p className="font-oswald text-3xl font-bold text-[#FF8400]">
              💰 {coins.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Фильтры по типу */}
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => setSelectedType(null)}
            className={`font-mono text-[13px] px-4 py-2 rounded-2xl transition-colors ${
              !selectedType
                ? "bg-[#FF8400] text-white font-semibold"
                : "bg-[#2A3550] text-[#8B95A8] hover:text-white"
            }`}
          >
            Все
          </button>
          {types.map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`font-mono text-[13px] px-4 py-2 rounded-2xl transition-colors flex items-center gap-2 ${
                selectedType === type
                  ? "bg-[#FF8400] text-white font-semibold"
                  : "bg-[#2A3550] text-[#8B95A8] hover:text-white"
              }`}
            >
              <span>{TYPE_LABELS[type]?.icon}</span>
              <span>{TYPE_LABELS[type]?.label || type}</span>
            </button>
          ))}
        </div>

        {/* Как заработать монеты */}
        <div className="bg-[#1E2740] rounded-2xl p-6 border border-[#2A3550]/50 mb-8">
          <h2 className="font-oswald text-lg font-bold text-white mb-4">💡 Как заработать монеты?</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-[#1A2236] rounded-xl">
              <div className="text-3xl mb-2">🏆</div>
              <p className="font-mono text-[13px] text-white font-medium">Челленджи</p>
              <p className="font-mono text-[12px] text-[#FF8400]">50-500 💰</p>
            </div>
            <div className="text-center p-4 bg-[#1A2236] rounded-xl">
              <div className="text-3xl mb-2">⭐</div>
              <p className="font-mono text-[13px] text-white font-medium">Отзывы</p>
              <p className="font-mono text-[12px] text-[#FF8400]">10 💰</p>
            </div>
            <div className="text-center p-4 bg-[#1A2236] rounded-xl">
              <div className="text-3xl mb-2">🎯</div>
              <p className="font-mono text-[13px] text-white font-medium">Оценки</p>
              <p className="font-mono text-[12px] text-[#FF8400]">2 💰</p>
            </div>
            <div className="text-center p-4 bg-[#1A2236] rounded-xl">
              <div className="text-3xl mb-2">📅</div>
              <p className="font-mono text-[13px] text-white font-medium">Ежедневно</p>
              <p className="font-mono text-[12px] text-[#FF8400]">5-25 💰</p>
            </div>
          </div>
        </div>

        {/* Предметы по редкости */}
        {rarityOrder.map((rarity) => {
          const rarityItems = groupedByRarity[rarity];
          if (!rarityItems?.length) return null;

          const colors = RARITY_COLORS[rarity];

          return (
            <section key={rarity} className="mb-10">
              <h2 className={`font-oswald text-xl font-bold mb-4 ${colors.text}`}>
                {RARITY_LABELS[rarity]} ({rarityItems.length})
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {rarityItems.map((item) => {
                  const isPurchased = purchasedItemIds.includes(item.id);
                  const canAfford = coins >= item.price;

                  return (
                    <div
                      key={item.id}
                      className={`relative flex flex-col rounded-xl overflow-hidden border-2 ${colors.border} ${colors.bg} ${colors.glow} transition-transform hover:scale-105`}
                    >
                      {/* Превью */}
                      <div className="aspect-square bg-slate-800/30 rounded-t-xl overflow-hidden flex-shrink-0">
                        <ItemPreview type={item.type} value={item.value} name={item.name} />
                      </div>

                      {/* Инфо */}
                      <div className="flex-1 flex flex-col p-3 bg-slate-900/50 rounded-b-xl">
                        <div className="flex items-start gap-2 mb-1">
                          <span className="text-lg flex-shrink-0">{TYPE_LABELS[item.type]?.icon || "🎁"}</span>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-white font-medium text-sm line-clamp-1">{item.name}</h3>
                            {item.description && (
                              <p className="text-slate-500 text-xs line-clamp-2 mt-0.5">{item.description}</p>
                            )}
                          </div>
                        </div>
                        
                        {/* Где используется */}
                        <div className="mt-2 mb-2 p-2 bg-slate-800/50 rounded-lg border border-slate-700/50">
                          <div className="flex items-center gap-1.5 text-xs">
                            <span className="text-amber-400">📍</span>
                            <span className="text-slate-400">{TYPE_LABELS[item.type]?.usage || "Используется в профиле"}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-auto pt-2">
                          <span className="text-amber-400 font-bold">
                            💰 {item.price}
                          </span>

                          {isPurchased ? (
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => handleEquip(item.id, true)}
                              >
                                Применить
                              </Button>
                            </div>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => handlePurchase(item)}
                              disabled={!canAfford || isPurchasing === item.id}
                              className={!canAfford ? "opacity-50" : ""}
                            >
                              {isPurchasing === item.id ? "..." : "Купить"}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

