const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;

async function searchUnsplash(query) {
  if (!UNSPLASH_ACCESS_KEY) {
    console.log('❌ UNSPLASH_ACCESS_KEY не настроен');
    return null;
  }

  const response = await fetch(
    `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=5&orientation=landscape`,
    {
      headers: {
        Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
      },
    }
  );

  if (!response.ok) {
    console.log('❌ Ошибка Unsplash API:', response.status);
    return null;
  }

  const data = await response.json();
  if (data.results && data.results.length > 0) {
    return data.results[0];
  }
  return null;
}

async function addCoverToLastArticle() {
  try {
    // Получаем последнюю статью
    const article = await prisma.article.findFirst({
      orderBy: { createdAt: 'desc' },
    });

    if (!article) {
      console.log('❌ Статьи не найдены');
      return;
    }

    console.log('📰 Статья:', article.title);
    console.log('🔍 Ищу изображение...');

    // Ищем изображение по теме (Нолан = cinema director)
    const photo = await searchUnsplash('Christopher Nolan movie director cinema');

    if (!photo) {
      console.log('❌ Изображение не найдено');
      return;
    }

    // Обновляем статью
    await prisma.article.update({
      where: { id: article.id },
      data: { cover: photo.urls.regular },
    });

    console.log('✅ Обложка добавлена!');
    console.log('🖼 URL:', photo.urls.regular);
    console.log('📷 Автор:', photo.user.name);
    console.log('🔗 Статья: http://localhost:3000/blog/' + article.slug);

  } catch (error) {
    console.error('❌ Ошибка:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

addCoverToLastArticle();

