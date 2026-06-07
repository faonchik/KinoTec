# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
npm run dev               # Start Next.js dev server

# Build (runs prisma generate + migrate deploy + next build)
npm run build

# Database
npm run db:migrate        # Create and apply new migration (dev)
npm run db:push           # Push schema changes without migration
npm run db:seed           # Seed the database (runs prisma/seed.ts)
npm run db:studio         # Open Prisma Studio GUI
npm run db:reset          # Reset database and re-run all migrations

# Production start (after build)
npm run start

# Linting
npm run lint

# Docker
npm run docker:up         # Build and start all containers
npm run docker:down       # Stop containers
npm run docker:logs       # Follow container logs
npm run docker:rebuild    # Rebuild only the app container

# TMDB data import
npm run import:tmdb       # Import movies from TMDB API

# Deploy (pushes with GitHub Actions auto-deploy)
auto-push.bat "commit message"
```

For Docker-based DB commands:
```bash
docker-compose exec app npx prisma migrate deploy
docker-compose exec app npx prisma db seed
```

## Architecture

### Stack
- **Next.js 15** (App Router) + **React 19** + **TypeScript**
- **Prisma ORM** → **PostgreSQL**
- **NextAuth v4** — credentials-only auth, JWT strategy, roles: `USER | MODERATOR | ADMIN`
- **next-intl** — i18n with `ru` (default) and `en` locales
- **Zustand** — client state (`store/useAuthStore.ts`, `store/useMovieStore.ts`)
- **TanStack Query** — server state / data fetching
- **Tailwind CSS** — styling with 11 CSS-variable-based themes
- **Groq API (Llama 3.3)** — AI chat recommendations (`lib/groq.ts`)
- **Telegram Bot** — separate Node.js service in `bot/` with its own `package.json`

### Directory layout
- `app/` — Next.js App Router pages and API routes
  - `app/api/` — all REST API endpoints (auth, movies, series, users, shop, party, etc.)
  - `app/admin/` — admin panel (requires ADMIN or MODERATOR role)
  - `app/auth/` — sign-in, sign-up, forgot/reset password pages
- `components/` — shared React components, grouped by domain (`movies/`, `reviews/`, `player/`, `shop/`, `ai/`, `ui/`, `layout/`)
- `lib/` — server-side utilities: `auth.ts` (NextAuth config), `prisma.ts` (singleton client), `tmdb.ts` (TMDB API client), `groq.ts` (AI client), `email.ts`, `security/` (headers, CORS, rate limiting, logger)
- `i18n/` — locale config (`config.ts`) and message files (`messages/ru.json`, `messages/en.json`)
- `store/` — Zustand stores (client-only)
- `types/` — TypeScript ambient declarations (`next-auth.d.ts` extends session with `id` and `role`)
- `prisma/` — schema, migrations, and seed scripts
- `scripts/` — one-off data scripts (TMDB import, content seeding, bio updates)
- `bot/` — standalone Telegram bot (separate Node.js process, shares the same DB)
- `public/` — static assets

### Key patterns

**Authentication**: NextAuth JWT with role stored in token. Middleware (`middleware.ts`) protects non-public routes; `/admin` requires ADMIN or MODERATOR. Avatar is intentionally excluded from the JWT to avoid cookie size limits and fetched via API instead.

**Themes**: Applied via CSS variables. The active theme class (e.g. `theme-dark`, `theme-cyberpunk`) is set on `<html>`. Theme is stored per-user in `User.theme` and in Zustand.

**Image proxying**: External images (TMDB, Unsplash) are served through `/api/images/proxy` to avoid CORS and enable caching. Use `<ProxiedImage>` component rather than direct `<Image>` from Next.js for external URLs.

**TMDB API key**: В `.env` положите `TMDB_API_KEY` — либо **v3 API Key** (строка в настройках проекта, в URL как `api_key=`), либо **Read Access Token** (JWT, начинается с `eyJ` — в коде уходит в заголовок `Authorization: Bearer`). Неверный формат (JWT в query) давал 401. Если ключ не задан, используется пакет `freekeys`.

**TMDB из РФ / блокировки**: серверные запросы к `api.themoviedb.org` и загрузка картинок через `/api/images/proxy` уважают прокси: задайте `TMDB_OUTBOUND_PROXY` (например `http://127.0.0.1:7890`) или стандартные `HTTPS_PROXY` / `HTTP_PROXY`. Альтернатива — DNS вроде Quad9 на хосте ([обзор](https://bafista.ru/the-movie-database-tmdb-zablokirovali-est-prostoe-reshenie/)).

**Coins/Shop system**: Users earn virtual coins (`User.coins`) through ratings, reviews, challenges, and daily bonuses. Coins are spent in the shop to buy cosmetic items (`ShopItem`) applied to profile customization fields on `User`.

**Localization**: All UI strings live in `i18n/messages/{ru,en}.json`. Server components use `getTranslations()`, client components use `useTranslations()` from `next-intl`.

**Review moderation**: Both `Review` and `SeriesReview` default to `isApproved: false`. They only appear publicly after an admin/moderator sets `isApproved: true`. Always filter by `isApproved: true` in public-facing API queries.

**Zod validation**: Input schemas for API routes live in `lib/validations/`. Use these (or add new ones there) rather than inline validation.

**Security**: Rate limiting, CORS, security headers, and event logging are in `lib/security/`. Guards for IDOR, SSRF, file upload, mass operations, prototype pollution, and request sanitization are available there — import them in new API routes as appropriate. Enumeration protection uses identical error messages and timing for auth failures.

**SeriesWatchParty** is a simplified model (no `participants` or `messages` relations) compared to `WatchParty`. It tracks current season/episode instead of a single timestamp.

### Required environment variables
```
DATABASE_URL
NEXTAUTH_SECRET
NEXTAUTH_URL
GROQ_API_KEY
TELEGRAM_BOT_TOKEN
TELEGRAM_ADMIN_ID
SMTP_HOST / SMTP_USER / SMTP_PASS   # or configure Resend/Brevo
TMDB_API_KEY                         # v3 API Key или Read Access Token (JWT); иначе freekeys
TMDB_OUTBOUND_PROXY                  # опционально: http(s)://… для TMDB и image proxy (или HTTPS_PROXY)
RECAPTCHA_SITE_KEY / RECAPTCHA_SECRET_KEY
```
