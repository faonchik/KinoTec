import { Metadata } from "next";
import { getLocale } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  if (locale === "en") {
    return {
      title: "About | KinoTeka",
      description: "Information about the KinoTeka project",
    };
  }
  return {
    title: "О проекте | КиноТека",
    description: "Информация о проекте КиноТека",
  };
}

export const dynamic = "force-static";

export default async function AboutPage() {
  const locale = await getLocale();

  if (locale === "en") {
    return (
      <div className="min-h-screen py-12" style={{ backgroundColor: 'var(--bg-primary, #0f172a)' }}>
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-4xl font-bold mb-8" style={{ color: 'var(--text-primary, #f1f5f9)' }}>About Project</h1>
          
          <div className="prose prose-invert max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--text-primary, #f1f5f9)' }}>
                KinoTeka — Your Guide to the World of Cinema
              </h2>
              <p className="leading-relaxed mb-4" style={{ color: 'var(--text-secondary, #cbd5e1)' }}>
                KinoTeka is a modern information portal about movies, TV shows, actors, and directors.
                We created a platform where you can find detailed information about any movie or TV show,
                read reviews from other users, rate watched movies, and discover new cinematic works.
              </p>
              <p className="leading-relaxed mb-4" style={{ color: 'var(--text-secondary, #cbd5e1)' }}>
                Our mission is to make searching and exploring cinema as convenient and interesting as possible.
                We collect information from various authoritative sources to provide you with the most complete
                and up-to-date details about movies and TV shows. Our database is constantly updated with new
                releases and details.
              </p>
              <p className="leading-relaxed mb-4" style={{ color: 'var(--text-secondary, #cbd5e1)' }}>
                KinoTeka is not just a movie catalog. It is a community of movie buffs where everyone can
                share their opinion, create personal lists, follow premieres, and get personalized
                recommendations based on their preferences.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--text-primary, #f1f5f9)' }}>
                Platform Features
              </h2>
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary, #1e293b)' }}>
                  <h3 className="font-semibold mb-2" style={{ color: 'var(--accent, #f59e0b)' }}>📚 Extensive Database</h3>
                  <p className="text-sm" style={{ color: 'var(--text-secondary, #cbd5e1)' }}>
                    Thousands of movies and TV shows with detailed information, cast, directors, and genres
                  </p>
                </div>
                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary, #1e293b)' }}>
                  <h3 className="font-semibold mb-2" style={{ color: 'var(--accent, #f59e0b)' }}>⭐ Rating System</h3>
                  <p className="text-sm" style={{ color: 'var(--text-secondary, #cbd5e1)' }}>
                    Rate movies, read and write reviews, and share opinions with other users
                  </p>
                </div>
                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary, #1e293b)' }}>
                  <h3 className="font-semibold mb-2" style={{ color: 'var(--accent, #f59e0b)' }}>🎯 Personalized Recommendations</h3>
                  <p className="text-sm" style={{ color: 'var(--text-secondary, #cbd5e1)' }}>
                    Smart recommendation system based on your watch history, ratings, and preferences
                  </p>
                </div>
                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary, #1e293b)' }}>
                  <h3 className="font-semibold mb-2" style={{ color: 'var(--accent, #f59e0b)' }}>📅 Premiere Calendar</h3>
                  <p className="text-sm" style={{ color: 'var(--text-secondary, #cbd5e1)' }}>
                    Keep track of upcoming premieres and new cinema releases
                  </p>
                </div>
                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary, #1e293b)' }}>
                  <h3 className="font-semibold mb-2" style={{ color: 'var(--accent, #f59e0b)' }}>📋 Collections</h3>
                  <p className="text-sm" style={{ color: 'var(--text-secondary, #cbd5e1)' }}>
                    Create your own movie collections and share them with the community
                  </p>
                </div>
                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary, #1e293b)' }}>
                  <h3 className="font-semibold mb-2" style={{ color: 'var(--accent, #f59e0b)' }}>🎮 Gamification</h3>
                  <p className="text-sm" style={{ color: 'var(--text-secondary, #cbd5e1)' }}>
                    Achievements, coin system, and a profile customization shop
                  </p>
                </div>
                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary, #1e293b)' }}>
                  <h3 className="font-semibold mb-2" style={{ color: 'var(--accent, #f59e0b)' }}>👥 Social Features</h3>
                  <p className="text-sm" style={{ color: 'var(--text-secondary, #cbd5e1)' }}>
                    Watch movies together with friends, comment, and discuss
                  </p>
                </div>
                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary, #1e293b)' }}>
                  <h3 className="font-semibold mb-2" style={{ color: 'var(--accent, #f59e0b)' }}>🎨 Customization</h3>
                  <p className="text-sm" style={{ color: 'var(--text-secondary, #cbd5e1)' }}>
                    Customize your profile appearance with frames, badges, colors, and layout themes
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--text-primary, #f1f5f9)' }}>
                Technologies
              </h2>
              <p className="leading-relaxed mb-4" style={{ color: 'var(--text-secondary, #cbd5e1)' }}>
                KinoTeka is built on modern technologies to ensure fast performance,
                a user-friendly interface, and reliability. We use Next.js for server-side rendering,
                PostgreSQL for data storage, and many other modern tools to deliver the best user experience.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--text-primary, #f1f5f9)' }}>
                Contacts & Feedback
              </h2>
              <p className="leading-relaxed mb-4" style={{ color: 'var(--text-secondary, #cbd5e1)' }}>
                We are always open to feedback and suggestions. If you have questions,
                ideas for improving the platform, or want to report a bug, please contact us
                via the feedback form on the website or write to us by email.
              </p>
              <p className="leading-relaxed" style={{ color: 'var(--text-secondary, #cbd5e1)' }}>
                We value every user and strive to make KinoTeka the best platform for movie lovers.
                Your feedback helps us get better!
              </p>
            </section>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12" style={{ backgroundColor: 'var(--bg-primary, #0f172a)' }}>
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8" style={{ color: 'var(--text-primary, #f1f5f9)' }}>О проекте</h1>
        
        <div className="prose prose-invert max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--text-primary, #f1f5f9)' }}>
              КиноТека — ваш путеводитель в мире кино
            </h2>
            <p className="leading-relaxed mb-4" style={{ color: 'var(--text-secondary, #cbd5e1)' }}>
              КиноТека — это современный информационный портал о фильмах, сериалах, актёрах и режиссёрах. 
              Мы создали платформу, где вы можете найти подробную информацию о любом фильме или сериале, 
              прочитать отзывы других пользователей, оценить просмотренные картины и открыть для себя 
              новые произведения кинематографа.
            </p>
            <p className="leading-relaxed mb-4" style={{ color: 'var(--text-secondary, #cbd5e1)' }}>
              Наша миссия — сделать поиск и изучение кино максимально удобным и интересным. 
              Мы собираем информацию из различных авторитетных источников, чтобы предоставить вам 
              наиболее полную и актуальную информацию о фильмах и сериалах. Наша база данных постоянно 
              пополняется новыми релизами и обновлениями.
            </p>
            <p className="leading-relaxed mb-4" style={{ color: 'var(--text-secondary, #cbd5e1)' }}>
              КиноТека — это не просто каталог фильмов. Это сообщество киноманов, где каждый может 
              поделиться своим мнением, создать персональные подборки, следить за премьерами и 
              получать персональные рекомендации на основе своих предпочтений.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--text-primary, #f1f5f9)' }}>
              Возможности платформы
            </h2>
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary, #1e293b)' }}>
                <h3 className="font-semibold mb-2" style={{ color: 'var(--accent, #f59e0b)' }}>📚 Обширная база данных</h3>
                <p className="text-sm" style={{ color: 'var(--text-secondary, #cbd5e1)' }}>
                  Тысячи фильмов и сериалов с подробной информацией, актёрским составом, режиссёрами и жанрами
                </p>
              </div>
              <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary, #1e293b)' }}>
                <h3 className="font-semibold mb-2" style={{ color: 'var(--accent, #f59e0b)' }}>⭐ Система рейтингов</h3>
                <p className="text-sm" style={{ color: 'var(--text-secondary, #cbd5e1)' }}>
                  Оценивайте фильмы, читайте и пишите отзывы, делитесь мнением с другими пользователями
                </p>
              </div>
              <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary, #1e293b)' }}>
                <h3 className="font-semibold mb-2" style={{ color: 'var(--accent, #f59e0b)' }}>🎯 Персональные рекомендации</h3>
                <p className="text-sm" style={{ color: 'var(--text-secondary, #cbd5e1)' }}>
                  Умная система рекомендаций на основе ваших просмотров, оценок и предпочтений
                </p>
              </div>
              <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary, #1e293b)' }}>
                <h3 className="font-semibold mb-2" style={{ color: 'var(--accent, #f59e0b)' }}>📅 Календарь премьер</h3>
                <p className="text-sm" style={{ color: 'var(--text-secondary, #cbd5e1)' }}>
                  Следите за предстоящими премьерами и новинками кинематографа
                </p>
              </div>
              <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary, #1e293b)' }}>
                <h3 className="font-semibold mb-2" style={{ color: 'var(--accent, #f59e0b)' }}>📋 Подборки</h3>
                <p className="text-sm" style={{ color: 'var(--text-secondary, #cbd5e1)' }}>
                  Создавайте собственные подборки фильмов и делитесь ими с сообществом
                </p>
              </div>
              <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary, #1e293b)' }}>
                <h3 className="font-semibold mb-2" style={{ color: 'var(--accent, #f59e0b)' }}>🎮 Геймификация</h3>
                <p className="text-sm" style={{ color: 'var(--text-secondary, #cbd5e1)' }}>
                  Система достижений, монет и магазин кастомизации профиля
                </p>
              </div>
              <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary, #1e293b)' }}>
                <h3 className="font-semibold mb-2" style={{ color: 'var(--accent, #f59e0b)' }}>👥 Социальные функции</h3>
                <p className="text-sm" style={{ color: 'var(--text-secondary, #cbd5e1)' }}>
                  Смотрите фильмы вместе с друзьями, комментируйте и обсуждайте
                </p>
              </div>
              <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary, #1e293b)' }}>
                <h3 className="font-semibold mb-2" style={{ color: 'var(--accent, #f59e0b)' }}>🎨 Кастомизация</h3>
                <p className="text-sm" style={{ color: 'var(--text-secondary, #cbd5e1)' }}>
                  Настройте внешний вид профиля с помощью рамок, значков, цветов и тем оформления
                </p>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--text-primary, #f1f5f9)' }}>
              Технологии
            </h2>
            <p className="leading-relaxed mb-4" style={{ color: 'var(--text-secondary, #cbd5e1)' }}>
              КиноТека построена на современных технологиях для обеспечения быстрой работы, 
              удобного интерфейса и надёжности. Мы используем Next.js для серверного рендеринга, 
              PostgreSQL для хранения данных и множество других современных инструментов для 
              создания лучшего опыта использования.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--text-primary, #f1f5f9)' }}>
              Контакты и обратная связь
            </h2>
            <p className="leading-relaxed mb-4" style={{ color: 'var(--text-secondary, #cbd5e1)' }}>
              Мы всегда открыты для обратной связи и предложений. Если у вас есть вопросы, 
              идеи по улучшению платформы или вы хотите сообщить об ошибке, пожалуйста, 
              свяжитесь с нами через форму обратной связи на сайте или напишите нам на почту.
            </p>
            <p className="leading-relaxed" style={{ color: 'var(--text-secondary, #cbd5e1)' }}>
              Мы ценим каждого пользователя и стремимся сделать КиноТеку лучшей платформой 
              для любителей кино. Ваши отзывы помогают нам становиться лучше!
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

