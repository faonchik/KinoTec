import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// 🎨 Магазин кастомизации - большой пак предметов
const shopItems = [
  // ========== РАМКИ ПРОФИЛЯ ==========
  // Common
  { name: "Простая рамка", type: "PROFILE_FRAME", value: "frame-simple", price: 100, rarity: "COMMON", description: "Минималистичная тонкая рамка" },
  { name: "Круглая рамка", type: "PROFILE_FRAME", value: "frame-circle", price: 150, rarity: "COMMON", description: "Классическая круглая рамка" },
  { name: "Квадратная рамка", type: "PROFILE_FRAME", value: "frame-square", price: 100, rarity: "COMMON", description: "Простая квадратная рамка" },
  { name: "Тонкая рамка", type: "PROFILE_FRAME", value: "frame-thin", price: 100, rarity: "COMMON", description: "Едва заметная рамка" },
  // Uncommon
  { name: "Градиентная рамка", type: "PROFILE_FRAME", value: "frame-gradient", price: 300, rarity: "UNCOMMON", description: "Рамка с плавным градиентом" },
  { name: "Неоновая рамка", type: "PROFILE_FRAME", value: "frame-neon", price: 400, rarity: "UNCOMMON", description: "Яркая светящаяся рамка" },
  { name: "Пиксельная рамка", type: "PROFILE_FRAME", value: "frame-pixel", price: 350, rarity: "UNCOMMON", description: "Ретро-стиль 8-бит" },
  { name: "Двойная рамка", type: "PROFILE_FRAME", value: "frame-double", price: 350, rarity: "UNCOMMON", description: "Двойной контур" },
  { name: "Пунктирная рамка", type: "PROFILE_FRAME", value: "frame-dashed", price: 300, rarity: "UNCOMMON", description: "Пунктирный контур" },
  // Rare
  { name: "Золотая рамка", type: "PROFILE_FRAME", value: "frame-gold", price: 800, rarity: "RARE", description: "Престижная золотая рамка" },
  { name: "Киноплёнка", type: "PROFILE_FRAME", value: "frame-film", price: 700, rarity: "RARE", description: "Рамка в виде плёнки" },
  { name: "Звёздная рамка", type: "PROFILE_FRAME", value: "frame-stars", price: 750, rarity: "RARE", description: "С анимированными звёздами" },
  { name: "Серебряная рамка", type: "PROFILE_FRAME", value: "frame-silver", price: 700, rarity: "RARE", description: "Элегантная серебряная рамка" },
  { name: "Бронзовая рамка", type: "PROFILE_FRAME", value: "frame-bronze", price: 650, rarity: "RARE", description: "Классическая бронзовая рамка" },
  { name: "Винтажная рамка", type: "PROFILE_FRAME", value: "frame-vintage", price: 750, rarity: "RARE", description: "В стиле ретро" },
  // Epic
  { name: "Огненная рамка", type: "PROFILE_FRAME", value: "frame-fire", price: 1500, rarity: "EPIC", description: "Пылающая анимированная рамка" },
  { name: "Ледяная рамка", type: "PROFILE_FRAME", value: "frame-ice", price: 1500, rarity: "EPIC", description: "Морозные узоры" },
  { name: "Радужная рамка", type: "PROFILE_FRAME", value: "frame-rainbow", price: 1800, rarity: "EPIC", description: "Переливающаяся радуга" },
  { name: "Электрическая рамка", type: "PROFILE_FRAME", value: "frame-electric", price: 1600, rarity: "EPIC", description: "Электрические разряды" },
  { name: "Космическая рамка", type: "PROFILE_FRAME", value: "frame-space", price: 1700, rarity: "EPIC", description: "Звёздное пространство" },
  { name: "Голографическая рамка", type: "PROFILE_FRAME", value: "frame-hologram", price: 1800, rarity: "EPIC", description: "Голографический эффект" },
  // Legendary
  { name: "Рамка Оскар", type: "PROFILE_FRAME", value: "frame-oscar", price: 5000, rarity: "LEGENDARY", description: "Золотая статуэтка Оскар" },
  { name: "Голливудская звезда", type: "PROFILE_FRAME", value: "frame-hollywood", price: 5000, rarity: "LEGENDARY", description: "Звезда аллеи славы" },
  { name: "Рамка Легенда", type: "PROFILE_FRAME", value: "frame-legend", price: 6000, rarity: "LEGENDARY", description: "Легендарная рамка" },
  { name: "Рамка Император", type: "PROFILE_FRAME", value: "frame-emperor", price: 7000, rarity: "LEGENDARY", description: "Императорская роскошь" },

  // ========== ЗНАЧКИ ==========
  // Common
  { name: "🎬", type: "PROFILE_BADGE", value: "🎬", price: 50, rarity: "COMMON", description: "Значок кинолюбителя" },
  { name: "🎥", type: "PROFILE_BADGE", value: "🎥", price: 50, rarity: "COMMON", description: "Значок режиссёра" },
  { name: "🍿", type: "PROFILE_BADGE", value: "🍿", price: 50, rarity: "COMMON", description: "Попкорн" },
  { name: "🎭", type: "PROFILE_BADGE", value: "🎭", price: 75, rarity: "COMMON", description: "Театральные маски" },
  { name: "📽️", type: "PROFILE_BADGE", value: "📽️", price: 50, rarity: "COMMON", description: "Кинопроектор" },
  { name: "🎞️", type: "PROFILE_BADGE", value: "🎞️", price: 50, rarity: "COMMON", description: "Киноплёнка" },
  { name: "🎪", type: "PROFILE_BADGE", value: "🎪", price: 75, rarity: "COMMON", description: "Цирк" },
  { name: "🎨", type: "PROFILE_BADGE", value: "🎨", price: 50, rarity: "COMMON", description: "Палитра" },
  // Uncommon
  { name: "⭐", type: "PROFILE_BADGE", value: "⭐", price: 200, rarity: "UNCOMMON", description: "Звезда" },
  { name: "🏆", type: "PROFILE_BADGE", value: "🏆", price: 250, rarity: "UNCOMMON", description: "Кубок" },
  { name: "💎", type: "PROFILE_BADGE", value: "💎", price: 300, rarity: "UNCOMMON", description: "Бриллиант" },
  { name: "🔥", type: "PROFILE_BADGE", value: "🔥", price: 200, rarity: "UNCOMMON", description: "Огонь" },
  { name: "✨", type: "PROFILE_BADGE", value: "✨", price: 250, rarity: "UNCOMMON", description: "Искры" },
  { name: "💫", type: "PROFILE_BADGE", value: "💫", price: 250, rarity: "UNCOMMON", description: "Звёздочка" },
  { name: "🎯", type: "PROFILE_BADGE", value: "🎯", price: 200, rarity: "UNCOMMON", description: "Мишень" },
  { name: "🎲", type: "PROFILE_BADGE", value: "🎲", price: 200, rarity: "UNCOMMON", description: "Кубик" },
  // Rare
  { name: "👑", type: "PROFILE_BADGE", value: "👑", price: 600, rarity: "RARE", description: "Корона" },
  { name: "🚀", type: "PROFILE_BADGE", value: "🚀", price: 550, rarity: "RARE", description: "Ракета" },
  { name: "🎖️", type: "PROFILE_BADGE", value: "🎖️", price: 600, rarity: "RARE", description: "Медаль" },
  { name: "🏅", type: "PROFILE_BADGE", value: "🏅", price: 550, rarity: "RARE", description: "Медалька" },
  { name: "🎗️", type: "PROFILE_BADGE", value: "🎗️", price: 500, rarity: "RARE", description: "Лента" },
  { name: "💍", type: "PROFILE_BADGE", value: "💍", price: 600, rarity: "RARE", description: "Кольцо" },
  // Epic
  { name: "⚡", type: "PROFILE_BADGE", value: "⚡", price: 1000, rarity: "EPIC", description: "Молния" },
  { name: "🌟", type: "PROFILE_BADGE", value: "🌟", price: 1200, rarity: "EPIC", description: "Сияющая звезда" },
  { name: "💠", type: "PROFILE_BADGE", value: "💠", price: 1100, rarity: "EPIC", description: "Алмаз" },
  { name: "🔮", type: "PROFILE_BADGE", value: "🔮", price: 1200, rarity: "EPIC", description: "Хрустальный шар" },
  { name: "🌠", type: "PROFILE_BADGE", value: "🌠", price: 1100, rarity: "EPIC", description: "Падающая звезда" },
  // Legendary
  { name: "🎖️", type: "PROFILE_BADGE", value: "🎖️", price: 3000, rarity: "LEGENDARY", description: "Медаль почёта" },
  { name: "👸", type: "PROFILE_BADGE", value: "👸", price: 3500, rarity: "LEGENDARY", description: "Королева кино" },
  { name: "🤴", type: "PROFILE_BADGE", value: "🤴", price: 3500, rarity: "LEGENDARY", description: "Король кино" },
  { name: "🏰", type: "PROFILE_BADGE", value: "🏰", price: 4000, rarity: "LEGENDARY", description: "Замок" },

  // ========== ЦВЕТА НИКНЕЙМА ==========
  // Common
  { name: "Синий", type: "NAME_COLOR", value: "#3b82f6", price: 100, rarity: "COMMON", description: "Классический синий" },
  { name: "Зелёный", type: "NAME_COLOR", value: "#22c55e", price: 100, rarity: "COMMON", description: "Изумрудный зелёный" },
  { name: "Красный", type: "NAME_COLOR", value: "#ef4444", price: 100, rarity: "COMMON", description: "Яркий красный" },
  { name: "Фиолетовый", type: "NAME_COLOR", value: "#a855f7", price: 100, rarity: "COMMON", description: "Королевский фиолетовый" },
  { name: "Жёлтый", type: "NAME_COLOR", value: "#eab308", price: 100, rarity: "COMMON", description: "Солнечный жёлтый" },
  { name: "Голубой", type: "NAME_COLOR", value: "#0ea5e9", price: 100, rarity: "COMMON", description: "Небесный голубой" },
  { name: "Серый", type: "NAME_COLOR", value: "#64748b", price: 100, rarity: "COMMON", description: "Нейтральный серый" },
  { name: "Белый", type: "NAME_COLOR", value: "#ffffff", price: 100, rarity: "COMMON", description: "Чистый белый" },
  // Uncommon
  { name: "Бирюзовый", type: "NAME_COLOR", value: "#14b8a6", price: 250, rarity: "UNCOMMON", description: "Морская волна" },
  { name: "Розовый", type: "NAME_COLOR", value: "#ec4899", price: 250, rarity: "UNCOMMON", description: "Яркий розовый" },
  { name: "Оранжевый", type: "NAME_COLOR", value: "#f97316", price: 250, rarity: "UNCOMMON", description: "Солнечный оранжевый" },
  { name: "Лайм", type: "NAME_COLOR", value: "#84cc16", price: 250, rarity: "UNCOMMON", description: "Свежий лайм" },
  { name: "Индиго", type: "NAME_COLOR", value: "#6366f1", price: 250, rarity: "UNCOMMON", description: "Глубокий индиго" },
  { name: "Фуксия", type: "NAME_COLOR", value: "#d946ef", price: 250, rarity: "UNCOMMON", description: "Яркая фуксия" },
  // Rare
  { name: "Золотой", type: "NAME_COLOR", value: "#fbbf24", price: 600, rarity: "RARE", description: "Премиум золотой" },
  { name: "Серебряный", type: "NAME_COLOR", value: "#94a3b8", price: 500, rarity: "RARE", description: "Элегантный серебряный" },
  { name: "Бронзовый", type: "NAME_COLOR", value: "#cd7f32", price: 500, rarity: "RARE", description: "Классическая бронза" },
  { name: "Платиновый", type: "NAME_COLOR", value: "#e5e7eb", price: 600, rarity: "RARE", description: "Благородная платина" },
  { name: "Изумрудный", type: "NAME_COLOR", value: "#10b981", price: 600, rarity: "RARE", description: "Драгоценный изумруд" },
  // Epic
  { name: "Градиент Закат", type: "NAME_COLOR", value: "gradient-sunset", price: 1200, rarity: "EPIC", description: "Переливающийся закат" },
  { name: "Градиент Океан", type: "NAME_COLOR", value: "gradient-ocean", price: 1200, rarity: "EPIC", description: "Глубины океана" },
  { name: "Градиент Северное сияние", type: "NAME_COLOR", value: "gradient-aurora", price: 1500, rarity: "EPIC", description: "Магия северного сияния" },
  { name: "Градиент Огонь", type: "NAME_COLOR", value: "gradient-fire", price: 1400, rarity: "EPIC", description: "Пламенный градиент" },
  { name: "Градиент Лёд", type: "NAME_COLOR", value: "gradient-ice", price: 1400, rarity: "EPIC", description: "Ледяной градиент" },
  { name: "Градиент Космос", type: "NAME_COLOR", value: "gradient-space", price: 1500, rarity: "EPIC", description: "Космический градиент" },
  // Legendary
  { name: "Радужный", type: "NAME_COLOR", value: "gradient-rainbow", price: 4000, rarity: "LEGENDARY", description: "Все цвета радуги" },
  { name: "Голографический", type: "NAME_COLOR", value: "gradient-holographic", price: 5000, rarity: "LEGENDARY", description: "Футуристический голографический эффект" },
  { name: "Неоновый", type: "NAME_COLOR", value: "gradient-neon", price: 4500, rarity: "LEGENDARY", description: "Яркий неоновый градиент" },
  { name: "Кристальный", type: "NAME_COLOR", value: "gradient-crystal", price: 5000, rarity: "LEGENDARY", description: "Переливающийся кристалл" },

  // ========== ТЕМЫ ОФОРМЛЕНИЯ ==========
  // Common
  { name: "Тёмная классика", type: "THEME", value: "theme-dark", price: 0, rarity: "COMMON", description: "Стандартная тёмная тема" },
  { name: "Светлая", type: "THEME", value: "theme-light", price: 200, rarity: "COMMON", description: "Светлая тема для дня" },
  // Uncommon
  { name: "Полуночный синий", type: "THEME", value: "theme-midnight", price: 400, rarity: "UNCOMMON", description: "Глубокий синий" },
  { name: "Лесная зелень", type: "THEME", value: "theme-forest", price: 400, rarity: "UNCOMMON", description: "Природные зелёные тона" },
  { name: "Аметист", type: "THEME", value: "theme-amethyst", price: 450, rarity: "UNCOMMON", description: "Фиолетовые оттенки" },
  // Rare
  { name: "Ретро кинотеатр", type: "THEME", value: "theme-retro", price: 800, rarity: "RARE", description: "Винтажный стиль 80-х" },
  { name: "Нуар", type: "THEME", value: "theme-noir", price: 900, rarity: "RARE", description: "Чёрно-белая классика" },
  { name: "Киберпанк", type: "THEME", value: "theme-cyberpunk", price: 1000, rarity: "RARE", description: "Неоновый футуризм" },
  // Epic
  { name: "Голливуд", type: "THEME", value: "theme-hollywood", price: 2000, rarity: "EPIC", description: "Золотая эпоха Голливуда" },
  { name: "Космос", type: "THEME", value: "theme-space", price: 2200, rarity: "EPIC", description: "Звёздные просторы" },
  // Legendary
  { name: "Хамелеон", type: "THEME", value: "theme-chameleon", price: 6000, rarity: "LEGENDARY", description: "Меняется в течение дня" },

  // ========== ЭФФЕКТЫ АВАТАРА ==========
  // Uncommon
  { name: "Искры", type: "AVATAR_EFFECT", value: "effect-sparkle", price: 400, rarity: "UNCOMMON", description: "Мерцающие искры" },
  { name: "Пульсация", type: "AVATAR_EFFECT", value: "effect-pulse", price: 350, rarity: "UNCOMMON", description: "Мягкая пульсация" },
  { name: "Тень", type: "AVATAR_EFFECT", value: "effect-shadow", price: 300, rarity: "UNCOMMON", description: "Глубокая тень" },
  { name: "Блик", type: "AVATAR_EFFECT", value: "effect-shine", price: 400, rarity: "UNCOMMON", description: "Блестящий эффект" },
  { name: "Размытие", type: "AVATAR_EFFECT", value: "effect-blur", price: 350, rarity: "UNCOMMON", description: "Лёгкое размытие" },
  // Rare
  { name: "Свечение", type: "AVATAR_EFFECT", value: "effect-glow", price: 700, rarity: "RARE", description: "Мягкое свечение" },
  { name: "Вращение", type: "AVATAR_EFFECT", value: "effect-rotate", price: 600, rarity: "RARE", description: "Медленное вращение" },
  { name: "Масштабирование", type: "AVATAR_EFFECT", value: "effect-scale", price: 650, rarity: "RARE", description: "Пульсирующее масштабирование" },
  { name: "Градиентная обводка", type: "AVATAR_EFFECT", value: "effect-gradient-border", price: 700, rarity: "RARE", description: "Градиентная рамка" },
  { name: "Двойное свечение", type: "AVATAR_EFFECT", value: "effect-double-glow", price: 750, rarity: "RARE", description: "Двойной эффект свечения" },
  // Epic
  { name: "Огонь", type: "AVATAR_EFFECT", value: "effect-fire", price: 1500, rarity: "EPIC", description: "Пылающий эффект" },
  { name: "Электричество", type: "AVATAR_EFFECT", value: "effect-electric", price: 1600, rarity: "EPIC", description: "Электрические разряды" },
  { name: "Лёд", type: "AVATAR_EFFECT", value: "effect-ice", price: 1500, rarity: "EPIC", description: "Ледяные кристаллы" },
  { name: "Радуга", type: "AVATAR_EFFECT", value: "effect-rainbow", price: 1700, rarity: "EPIC", description: "Радужное свечение" },
  { name: "Неон", type: "AVATAR_EFFECT", value: "effect-neon", price: 1600, rarity: "EPIC", description: "Неоновое свечение" },
  { name: "Космос", type: "AVATAR_EFFECT", value: "effect-space", price: 1800, rarity: "EPIC", description: "Космические частицы" },
  // Legendary
  { name: "Портал", type: "AVATAR_EFFECT", value: "effect-portal", price: 4500, rarity: "LEGENDARY", description: "Космический портал" },
  { name: "Хаос", type: "AVATAR_EFFECT", value: "effect-chaos", price: 5000, rarity: "LEGENDARY", description: "Хаотическая энергия" },
  { name: "Божественный свет", type: "AVATAR_EFFECT", value: "effect-divine", price: 5500, rarity: "LEGENDARY", description: "Божественное сияние" },

  // ========== ФОН ПРОФИЛЯ ==========
  // Uncommon
  { name: "Градиент синий", type: "BACKGROUND", value: "bg-gradient-blue", price: 300, rarity: "UNCOMMON", description: "Синий градиент" },
  { name: "Градиент закат", type: "BACKGROUND", value: "bg-gradient-sunset", price: 350, rarity: "UNCOMMON", description: "Тёплые тона заката" },
  // Rare
  { name: "Киноплёнка", type: "BACKGROUND", value: "bg-film-strip", price: 700, rarity: "RARE", description: "Паттерн киноплёнки" },
  { name: "Звёздное небо", type: "BACKGROUND", value: "bg-stars", price: 800, rarity: "RARE", description: "Ночное небо со звёздами" },
  { name: "Прожекторы", type: "BACKGROUND", value: "bg-spotlights", price: 750, rarity: "RARE", description: "Лучи прожекторов" },
  // Epic
  { name: "Красная дорожка", type: "BACKGROUND", value: "bg-red-carpet", price: 1800, rarity: "EPIC", description: "Премьера фильма" },
  { name: "Матрица", type: "BACKGROUND", value: "bg-matrix", price: 2000, rarity: "EPIC", description: "Падающий код" },
  // Legendary
  { name: "Голливудские холмы", type: "BACKGROUND", value: "bg-hollywood-hills", price: 5500, rarity: "LEGENDARY", description: "Панорама Голливуда" },

  // ========== СТИЛИ ЧАТА ==========
  // Uncommon
  { name: "Округлые сообщения", type: "CHAT_BUBBLE", value: "bubble-rounded", price: 200, rarity: "UNCOMMON", description: "Более округлые углы" },
  { name: "Квадратные сообщения", type: "CHAT_BUBBLE", value: "bubble-square", price: 200, rarity: "UNCOMMON", description: "Строгие углы" },
  { name: "С закруглёнными углами", type: "CHAT_BUBBLE", value: "bubble-smoothed", price: 200, rarity: "UNCOMMON", description: "Плавные углы" },
  { name: "С тенью", type: "CHAT_BUBBLE", value: "bubble-shadow", price: 250, rarity: "UNCOMMON", description: "С глубокой тенью" },
  // Rare
  { name: "Градиентные сообщения", type: "CHAT_BUBBLE", value: "bubble-gradient", price: 500, rarity: "RARE", description: "Градиентный фон" },
  { name: "Неоновые сообщения", type: "CHAT_BUBBLE", value: "bubble-neon", price: 600, rarity: "RARE", description: "Неоновая подсветка" },
  { name: "Свечение", type: "CHAT_BUBBLE", value: "bubble-glow", price: 550, rarity: "RARE", description: "Светящиеся сообщения" },
  { name: "С обводкой", type: "CHAT_BUBBLE", value: "bubble-outline", price: 500, rarity: "RARE", description: "С яркой обводкой" },
  // Epic
  { name: "Голографические", type: "CHAT_BUBBLE", value: "bubble-hologram", price: 1400, rarity: "EPIC", description: "Голографический эффект" },
  { name: "Радужные", type: "CHAT_BUBBLE", value: "bubble-rainbow", price: 1500, rarity: "EPIC", description: "Радужный градиент" },
  { name: "Космические", type: "CHAT_BUBBLE", value: "bubble-space", price: 1600, rarity: "EPIC", description: "Космический дизайн" },
  // Legendary
  { name: "Божественные", type: "CHAT_BUBBLE", value: "bubble-divine", price: 4000, rarity: "LEGENDARY", description: "Божественное сияние" },

  // ========== НАБОРЫ ЭМОДЗИ ==========
  // Uncommon
  { name: "Кино эмодзи", type: "EMOJI_PACK", value: "emoji-movie", price: 300, rarity: "UNCOMMON", description: "Набор кино-эмодзи" },
  { name: "Классические", type: "EMOJI_PACK", value: "emoji-classic", price: 250, rarity: "UNCOMMON", description: "Классические эмодзи" },
  // Rare
  { name: "Премиум эмодзи", type: "EMOJI_PACK", value: "emoji-premium", price: 700, rarity: "RARE", description: "Эксклюзивные эмодзи" },
  { name: "Анимированные", type: "EMOJI_PACK", value: "emoji-animated", price: 800, rarity: "RARE", description: "Анимированные эмодзи" },
  // Epic
  { name: "Легендарные эмодзи", type: "EMOJI_PACK", value: "emoji-legendary", price: 2000, rarity: "EPIC", description: "Уникальные эмодзи" },
];

// Экспортируем для использования в seed.ts
export { shopItems };

async function seedShop() {
  console.log("🛒 Создание предметов магазина...");

  for (const item of shopItems) {
    await prisma.shopItem.upsert({
      where: { 
        id: `shop-${item.value}` 
      },
      update: {
        name: item.name,
        description: item.description,
        type: item.type as any,
        value: item.value,
        price: item.price,
        rarity: item.rarity as any,
      },
      create: {
        id: `shop-${item.value}`,
        name: item.name,
        description: item.description,
        type: item.type as any,
        value: item.value,
        price: item.price,
        rarity: item.rarity as any,
      },
    });
  }

  console.log(`✅ Создано ${shopItems.length} предметов`);
}

seedShop()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

