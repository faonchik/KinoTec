-- Добавляем поле userId в Collection для персональных подборок
ALTER TABLE "Collection" ADD COLUMN IF NOT EXISTS "userId" TEXT;
ALTER TABLE "Collection" ADD CONSTRAINT "Collection_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Создаём индексы для производительности
CREATE INDEX IF NOT EXISTS "Collection_userId_idx" ON "Collection"("userId");
CREATE INDEX IF NOT EXISTS "Collection_isPublic_idx" ON "Collection"("isPublic");

