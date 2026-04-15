const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createNews() {
  try {
    const article = await prisma.article.create({
      data: {
        title: 'Кристофер Нолан анонсировал новый фильм на 2026 год',
        slug: 'nolan-new-film-2026-' + Date.now(),
        excerpt: 'Легендарный режиссёр Кристофер Нолан объявил о начале работы над новым масштабным проектом, который выйдет в 2026 году.',
        content: `Кристофер Нолан, известный своими шедеврами "Начало", "Интерстеллар" и "Оппенгеймер", официально подтвердил работу над новым фильмом.

По предварительной информации, это будет научно-фантастический триллер с оригинальным сценарием. Бюджет проекта оценивается в 200 миллионов долларов.

Студия Universal Pictures, с которой режиссёр сотрудничает после успеха "Оппенгеймера", уже забронировала дату премьеры на июль 2026 года.

В касте ожидается участие Киллиана Мёрфи и Роберта Паттинсона — актёров, с которыми Нолан работал ранее.

Это будет уже 13-й полнометражный фильм в карьере британского режиссёра.`,
        category: 'NEWS',
        published: true,
      },
    });
    console.log('✅ Статья создана!');
    console.log('📰 ID:', article.id);
    console.log('📝 Заголовок:', article.title);
    console.log('🔗 URL: http://localhost:3000/blog/' + article.slug);
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createNews();

