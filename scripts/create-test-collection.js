const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createCollection() {
  try {
    // Получаем фильмы из базы
    const movies = await prisma.movie.findMany({ take: 10 });
    
    if (movies.length === 0) {
      console.log('⚠️ В базе нет фильмов. Сначала импортируйте фильмы через бота.');
      return;
    }

    const collection = await prisma.collection.create({
      data: {
        title: 'Фильмы для уютного вечера',
        slug: 'cozy-evening-movies-' + Date.now(),
        description: 'Идеальная подборка фильмов для тёплого домашнего вечера. Эти картины создадут атмосферу уюта и подарят незабываемые эмоции.',
      },
    });

    // Добавляем фильмы в подборку
    for (let i = 0; i < Math.min(movies.length, 5); i++) {
      await prisma.collectionMovie.create({
        data: {
          collectionId: collection.id,
          movieId: movies[i].id,
          order: i,
        },
      });
    }

    console.log('✅ Подборка создана!');
    console.log('📚 ID:', collection.id);
    console.log('📝 Название:', collection.title);
    console.log('🎬 Фильмов добавлено:', Math.min(movies.length, 5));
    console.log('🔗 URL: http://localhost:3000/collections/' + collection.slug);
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createCollection();

