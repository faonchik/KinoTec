-- Создаём индексы для производительности
CREATE INDEX IF NOT EXISTS "Collection_userId_idx" ON "Collection"("userId");
CREATE INDEX IF NOT EXISTS "Collection_isPublic_idx" ON "Collection"("isPublic");

