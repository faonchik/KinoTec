# 🎬 КиноТека

Ваш путеводитель в мире кино. Информационный сайт о фильмах, сериалах, актерах и режиссерах.

## 🚀 Быстрый старт

### Требования

- Docker и Docker Compose
- Node.js 18+ (для локальной разработки)
- PostgreSQL (или через Docker)

### Установка

1. Клонируйте репозиторий:
```bash
git clone https://github.com/faonchik/KinoTec.git
cd KinoTec/kinoteka
```

2. Создайте файл `.env`:
```env
DATABASE_URL=postgresql://kinoteka:password@postgres:5432/kinoteka_db?schema=public
NEXTAUTH_SECRET=your-super-secret-key
NEXTAUTH_URL=http://localhost:3000
GROQ_API_KEY=your-groq-api-key
TELEGRAM_BOT_TOKEN=your-telegram-bot-token
SMTP_HOST=your-smtp-host
SMTP_USER=your-smtp-user
SMTP_PASS=your-smtp-password
```

3. Запустите через Docker:
```bash
docker-compose up -d --build
```

4. Примените миграции:
```bash
docker-compose exec app npx prisma migrate deploy
docker-compose exec app npx prisma db seed
```

5. Откройте в браузере: http://localhost:3000

## 📱 Адаптивный дизайн

Сайт полностью адаптирован для:
- 📱 Мобильных устройств (320px+)
- 📱 Планшетов (768px+)
- 💻 Десктопов (1024px+)
- 🖥️ Больших экранов (1280px+)

## 🤖 Telegram бот

Бот для управления контентом через Telegram. Подробнее в `bot/README.md`.

## 🎨 Темы оформления

Сайт поддерживает 11 различных тем:
- 🌙 Тёмная (по умолчанию)
- ☀️ Светлая
- 🌌 Полуночный синий
- 🌲 Лесная зелень
- 💜 Аметист
- 🎞️ Ретро кинотеатр
- 🎭 Нуар
- 🤖 Киберпанк
- 🏆 Голливуд
- 🚀 Космос
- 🦎 Хамелеон

## 🔄 Автоматический деплой

Настроен автоматический деплой через GitHub Actions. При каждом `git push` изменения автоматически деплоятся на хост.

**Использование:**
```cmd
auto-push.bat "Описание изменений"
```

Подробнее в `DEPLOY.md`.

## 📚 Документация

- [Настройка SMTP](SMTP_SETUP_GUIDE.md) - подробная инструкция по настройке email
- [Быстрая настройка email](QUICK_EMAIL_SETUP.md) - быстрый старт
- [Инструкция по деплою](DEPLOY.md) - настройка автоматического деплоя
- [Настройка переменных окружения](ENV_SETUP.md) - настройка .env файла

## 🛠️ Технологии

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL
- **AI**: Groq API (Llama 3.3)
- **Bot**: Telegram Bot API
- **Deployment**: Docker, Docker Compose

## 📄 Лицензия

MIT
