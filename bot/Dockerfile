FROM node:20-alpine

WORKDIR /app

# Копируем package.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем исходники
COPY . .

# Копируем Prisma схему из основного проекта
COPY ../prisma ./prisma

# Генерируем Prisma клиент
RUN npx prisma generate --schema=./prisma/schema.prisma

# Компилируем TypeScript
RUN npm run build

# Запускаем бота
CMD ["npm", "start"]

