# Stage 1: Dependencies
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package*.json ./
# postinstall → prisma generate; schema must exist before npm ci
COPY prisma ./prisma
RUN npm ci --legacy-peer-deps

# Stage 2: Builder
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXTJS_DOCKER_BUILD=true
ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"

# Сборка Next (без migrate deploy — в build нет доступа к БД)
RUN for i in 1 2 3; do \
    npx prisma generate --schema=./prisma/schema.prisma && break || \
    (echo "Attempt $i failed, retrying..." && sleep 10); \
    done && npx next build

# Stage 3: Runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV production

RUN apk add --no-cache libc6-compat openssl

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Копируем standalone сборку
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Копируем Prisma для миграций
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/prisma ./node_modules/prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma

RUN mkdir -p /tmp/.npm && chown nextjs:nodejs /tmp/.npm

USER nextjs

ENV NPM_CONFIG_CACHE=/tmp/.npm

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"
# Увеличиваем лимит размера заголовков для предотвращения HTTP 431 (64KB)
ENV NODE_OPTIONS="--max-http-header-size=65536"

CMD ["sh", "-c", "node node_modules/prisma/build/index.js migrate deploy --schema=./prisma/schema.prisma && exec node server.js"]
