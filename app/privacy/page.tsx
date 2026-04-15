import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Политика конфиденциальности | КиноТека",
  description: "Политика конфиденциальности КиноТека",
};

export const dynamic = "force-static";

export default async function PrivacyPage() {
  return (
    <div className="min-h-screen py-12" style={{ backgroundColor: 'var(--bg-primary, #0f172a)' }}>
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8" style={{ color: 'var(--text-primary, #f1f5f9)' }}>
          Политика конфиденциальности
        </h1>
        
        <div className="prose prose-invert max-w-none">
          <section className="mb-8">
            <p className="text-sm mb-6" style={{ color: 'var(--text-muted, #94a3b8)' }}>
              Последнее обновление: {new Date().toLocaleDateString("ru-RU", { year: "numeric", month: "long", day: "numeric" })}
            </p>
            
            <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--text-primary, #f1f5f9)' }}>
              1. Общие положения
            </h2>
            <p className="leading-relaxed mb-4" style={{ color: 'var(--text-secondary, #cbd5e1)' }}>
              Настоящая Политика конфиденциальности определяет порядок обработки и защиты персональных данных 
              пользователей веб-сайта КиноТека (далее — «Сайт»). Используя Сайт, вы соглашаетесь с условиями 
              настоящей Политики конфиденциальности.
            </p>
            <p className="leading-relaxed mb-4" style={{ color: 'var(--text-secondary, #cbd5e1)' }}>
              Администрация Сайта обязуется соблюдать конфиденциальность персональных данных пользователей 
              и принимать все возможные меры для их защиты от неправомерного доступа, изменения, раскрытия 
              или уничтожения.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--text-primary, #f1f5f9)' }}>
              2. Собираемые данные
            </h2>
            <p className="leading-relaxed mb-4" style={{ color: 'var(--text-secondary, #cbd5e1)' }}>
              При использовании Сайта мы можем собирать следующие типы данных:
            </p>
            <div className="space-y-4 mb-4">
              <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary, #1e293b)' }}>
                <h3 className="font-semibold mb-2" style={{ color: 'var(--accent, #f59e0b)' }}>
                  Персональные данные
                </h3>
                <ul className="list-disc list-inside space-y-1 text-sm" style={{ color: 'var(--text-secondary, #cbd5e1)' }}>
                  <li>Имя пользователя (при регистрации)</li>
                  <li>Адрес электронной почты (для регистрации и уведомлений)</li>
                  <li>Аватар профиля (опционально, загружается пользователем)</li>
                  <li>Пароль (хранится в зашифрованном виде)</li>
                </ul>
              </div>
              <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary, #1e293b)' }}>
                <h3 className="font-semibold mb-2" style={{ color: 'var(--accent, #f59e0b)' }}>
                  Данные активности
                </h3>
                <ul className="list-disc list-inside space-y-1 text-sm" style={{ color: 'var(--text-secondary, #cbd5e1)' }}>
                  <li>Просмотренные фильмы и сериалы</li>
                  <li>Оценки и рейтинги</li>
                  <li>Отзывы и комментарии</li>
                  <li>Созданные подборки и списки</li>
                  <li>История активности на сайте</li>
                </ul>
              </div>
              <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary, #1e293b)' }}>
                <h3 className="font-semibold mb-2" style={{ color: 'var(--accent, #f59e0b)' }}>
                  Технические данные
                </h3>
                <ul className="list-disc list-inside space-y-1 text-sm" style={{ color: 'var(--text-secondary, #cbd5e1)' }}>
                  <li>IP-адрес</li>
                  <li>Тип браузера и его версия</li>
                  <li>Операционная система</li>
                  <li>Информация об устройстве</li>
                  <li>Логи доступа и ошибок</li>
                </ul>
              </div>
              <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary, #1e293b)' }}>
                <h3 className="font-semibold mb-2" style={{ color: 'var(--accent, #f59e0b)' }}>
                  Данные о предпочтениях
                </h3>
                <ul className="list-disc list-inside space-y-1 text-sm" style={{ color: 'var(--text-secondary, #cbd5e1)' }}>
                  <li>Выбранная тема оформления</li>
                  <li>Настройки профиля и кастомизация</li>
                  <li>Языковые настройки</li>
                  <li>Предпочтения по жанрам и фильмам</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--text-primary, #f1f5f9)' }}>
              3. Использование данных
            </h2>
            <p className="leading-relaxed mb-4" style={{ color: 'var(--text-secondary, #cbd5e1)' }}>
              Собранные данные используются исключительно в следующих целях:
            </p>
            <ul className="list-disc list-inside space-y-2 mb-4" style={{ color: 'var(--text-secondary, #cbd5e1)' }}>
              <li>Предоставления доступа к функциям и сервисам Сайта</li>
              <li>Персонализации контента и рекомендаций на основе ваших предпочтений</li>
              <li>Улучшения работы Сайта и разработки новых функций</li>
              <li>Обработки ваших запросов, обращений и технической поддержки</li>
              <li>Отправки уведомлений о важных событиях (только при вашем согласии)</li>
              <li>Обеспечения безопасности и предотвращения мошенничества</li>
              <li>Соблюдения требований законодательства</li>
            </ul>
            <p className="leading-relaxed mb-4" style={{ color: 'var(--text-secondary, #cbd5e1)' }}>
              Мы не передаём ваши персональные данные третьим лицам, за исключением случаев, 
              предусмотренных законодательством или когда это необходимо для предоставления услуг.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--text-primary, #f1f5f9)' }}>
              4. Защита данных
            </h2>
            <p className="leading-relaxed mb-4" style={{ color: 'var(--text-secondary, #cbd5e1)' }}>
              Мы применяем комплексные меры для защиты ваших персональных данных:
            </p>
            <ul className="list-disc list-inside space-y-2 mb-4" style={{ color: 'var(--text-secondary, #cbd5e1)' }}>
              <li>Шифрование паролей с использованием современных алгоритмов (bcrypt)</li>
              <li>Защита от несанкционированного доступа с помощью систем безопасности</li>
              <li>Регулярное обновление систем безопасности и исправление уязвимостей</li>
              <li>Ограничение доступа к персональным данным только авторизованному персоналу</li>
              <li>Резервное копирование данных для предотвращения потери информации</li>
              <li>Мониторинг и логирование подозрительной активности</li>
            </ul>
            <p className="leading-relaxed mb-4" style={{ color: 'var(--text-secondary, #cbd5e1)' }}>
              Несмотря на принимаемые меры, ни один метод передачи данных через интернет 
              не является абсолютно безопасным. Мы не можем гарантировать абсолютную безопасность 
              данных, но прилагаем все усилия для их защиты.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--text-primary, #f1f5f9)' }}>
              5. Права пользователей
            </h2>
            <p className="leading-relaxed mb-4" style={{ color: 'var(--text-secondary, #cbd5e1)' }}>
              В соответствии с законодательством о защите персональных данных, вы имеете следующие права:
            </p>
            <ul className="list-disc list-inside space-y-2 mb-4" style={{ color: 'var(--text-secondary, #cbd5e1)' }}>
              <li>Право на получение информации о ваших персональных данных, которые мы обрабатываем</li>
              <li>Право на доступ к вашим персональным данным</li>
              <li>Право на исправление неточных или неполных данных</li>
              <li>Право на удаление ваших персональных данных (право на забвение)</li>
              <li>Право на ограничение обработки данных</li>
              <li>Право на переносимость данных</li>
              <li>Право на отзыв согласия на обработку данных в любое время</li>
              <li>Право на возражение против обработки данных</li>
            </ul>
            <p className="leading-relaxed mb-4" style={{ color: 'var(--text-secondary, #cbd5e1)' }}>
              Для реализации ваших прав вы можете связаться с нами через форму обратной связи 
              или написать на указанный email. Мы рассмотрим ваш запрос в течение 30 дней.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--text-primary, #f1f5f9)' }}>
              6. Cookies и аналогичные технологии
            </h2>
            <p className="leading-relaxed mb-4" style={{ color: 'var(--text-secondary, #cbd5e1)' }}>
              Сайт использует cookies и аналогичные технологии для улучшения работы, 
              персонализации контента и анализа использования Сайта. Cookies — это небольшие 
              текстовые файлы, которые сохраняются на вашем устройстве при посещении веб-сайта.
            </p>
            <p className="leading-relaxed mb-4" style={{ color: 'var(--text-secondary, #cbd5e1)' }}>
              Мы используем следующие типы cookies:
            </p>
            <ul className="list-disc list-inside space-y-2 mb-4" style={{ color: 'var(--text-secondary, #cbd5e1)' }}>
              <li>Необходимые cookies — для обеспечения базовой функциональности Сайта</li>
              <li>Функциональные cookies — для сохранения ваших предпочтений и настроек</li>
              <li>Аналитические cookies — для анализа использования Сайта и улучшения его работы</li>
            </ul>
            <p className="leading-relaxed mb-4" style={{ color: 'var(--text-secondary, #cbd5e1)' }}>
              Вы можете отключить cookies в настройках браузера, однако это может повлиять 
              на функциональность Сайта и ограничить доступ к некоторым функциям.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--text-primary, #f1f5f9)' }}>
              7. Хранение данных
            </h2>
            <p className="leading-relaxed mb-4" style={{ color: 'var(--text-secondary, #cbd5e1)' }}>
              Ваши персональные данные хранятся на защищённых серверах в течение срока, 
              необходимого для достижения целей их обработки, или в течение срока, установленного 
              законодательством. После истечения срока хранения данные удаляются или обезличиваются.
            </p>
            <p className="leading-relaxed mb-4" style={{ color: 'var(--text-secondary, #cbd5e1)' }}>
              При удалении аккаунта все связанные персональные данные будут удалены в течение 
              30 дней, за исключением случаев, когда законодательство требует их сохранения.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--text-primary, #f1f5f9)' }}>
              8. Изменения в Политике конфиденциальности
            </h2>
            <p className="leading-relaxed mb-4" style={{ color: 'var(--text-secondary, #cbd5e1)' }}>
              Мы оставляем за собой право вносить изменения в настоящую Политику конфиденциальности 
              в любое время. О существенных изменениях мы уведомим пользователей через Сайт, 
              по email или другими способами.
            </p>
            <p className="leading-relaxed mb-4" style={{ color: 'var(--text-secondary, #cbd5e1)' }}>
              Продолжая использовать Сайт после внесения изменений, вы соглашаетесь с новой 
              редакцией Политики конфиденциальности. Рекомендуем периодически просматривать 
              эту страницу для ознакомления с актуальной версией.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--text-primary, #f1f5f9)' }}>
              9. Контакты
            </h2>
            <p className="leading-relaxed mb-4" style={{ color: 'var(--text-secondary, #cbd5e1)' }}>
              По всем вопросам, связанным с обработкой персональных данных, реализацией ваших прав 
              или настоящей Политикой конфиденциальности, вы можете связаться с нами:
            </p>
            <div className="p-4 rounded-lg mt-4" style={{ backgroundColor: 'var(--bg-secondary, #1e293b)' }}>
              <p className="mb-2" style={{ color: 'var(--text-secondary, #cbd5e1)' }}>
                <strong style={{ color: 'var(--text-primary, #f1f5f9)' }}>Email:</strong> support@kinoteka.com
              </p>
              <p className="mb-2" style={{ color: 'var(--text-secondary, #cbd5e1)' }}>
                <strong style={{ color: 'var(--text-primary, #f1f5f9)' }}>Через форму обратной связи:</strong> на Сайте
              </p>
            </div>
            <p className="leading-relaxed mt-4" style={{ color: 'var(--text-secondary, #cbd5e1)' }}>
              Мы обязуемся рассмотреть ваш запрос в кратчайшие сроки и предоставить необходимую информацию.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

