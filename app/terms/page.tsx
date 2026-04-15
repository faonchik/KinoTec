import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Условия использования | КиноТека",
  description: "Условия использования КиноТека",
};

export const dynamic = "force-static";

export default async function TermsPage() {
  return (
    <div className="min-h-screen py-12" style={{ backgroundColor: 'var(--bg-primary, #0f172a)' }}>
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8" style={{ color: 'var(--text-primary, #f1f5f9)' }}>
          Условия использования
        </h1>
        
        <div className="prose prose-invert max-w-none">
          <section className="mb-8">
            <p className="text-sm mb-6" style={{ color: 'var(--text-muted, #94a3b8)' }}>
              Последнее обновление: {new Date().toLocaleDateString("ru-RU", { year: "numeric", month: "long", day: "numeric" })}
            </p>
            
            <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--text-primary, #f1f5f9)' }}>
              1. Принятие условий
            </h2>
            <p className="leading-relaxed mb-4" style={{ color: 'var(--text-secondary, #cbd5e1)' }}>
              Используя веб-сайт КиноТека (далее — «Сайт»), вы соглашаетесь с настоящими Условиями использования. 
              Если вы не согласны с какими-либо условиями, пожалуйста, не используйте Сайт.
            </p>
            <p className="leading-relaxed mb-4" style={{ color: 'var(--text-secondary, #cbd5e1)' }}>
              Настоящие Условия использования (далее — «Условия») регулируют отношения между администрацией Сайта 
              и пользователями. Используя Сайт, вы подтверждаете, что прочитали, поняли и согласны соблюдать 
              все положения настоящих Условий.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--text-primary, #f1f5f9)' }}>
              2. Использование Сайта
            </h2>
            <p className="leading-relaxed mb-4" style={{ color: 'var(--text-secondary, #cbd5e1)' }}>
              Вы обязуетесь использовать Сайт только в законных целях и в соответствии с настоящими Условиями, 
              а также применимым законодательством. При использовании Сайта запрещается:
            </p>
            <ul className="list-disc list-inside space-y-2 mb-4" style={{ color: 'var(--text-secondary, #cbd5e1)' }}>
              <li>Размещать незаконный, оскорбительный, клеветнический, дискриминационный или вредоносный контент</li>
              <li>Нарушать права интеллектуальной собственности третьих лиц</li>
              <li>Пытаться получить несанкционированный доступ к системам, данным или аккаунтам других пользователей</li>
              <li>Использовать автоматизированные средства (боты, скрипты) для сбора данных без письменного разрешения</li>
              <li>Создавать поддельные аккаунты, выдавать себя за другое лицо или организацию</li>
              <li>Распространять спам, рекламу или нежелательные сообщения</li>
              <li>Использовать Сайт для любых незаконных или мошеннических целей</li>
              <li>Нарушать работу Сайта или пытаться взломать его системы безопасности</li>
              <li>Собирать или хранить персональные данные других пользователей без их согласия</li>
            </ul>
            <p className="leading-relaxed mb-4" style={{ color: 'var(--text-secondary, #cbd5e1)' }}>
              Нарушение любого из указанных запретов может повлечь за собой блокировку аккаунта, 
              удаление контента и привлечение к ответственности в соответствии с законодательством.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--text-primary, #f1f5f9)' }}>
              3. Контент пользователей
            </h2>
            <p className="leading-relaxed mb-4" style={{ color: 'var(--text-secondary, #cbd5e1)' }}>
              Размещая контент на Сайте (отзывы, комментарии, рейтинги, подборки, изображения), 
              вы предоставляете нам неисключительную, безвозмездную, бессрочную лицензию на использование, 
              воспроизведение, распространение, модификацию и модерацию этого контента в рамках работы Сайта.
            </p>
            <p className="leading-relaxed mb-4" style={{ color: 'var(--text-secondary, #cbd5e1)' }}>
              Вы несёте полную ответственность за размещаемый контент и гарантируете, что:
            </p>
            <ul className="list-disc list-inside space-y-2 mb-4" style={{ color: 'var(--text-secondary, #cbd5e1)' }}>
              <li>Контент не нарушает права интеллектуальной собственности третьих лиц</li>
              <li>Контент не содержит незаконной, оскорбительной или клеветнической информации</li>
              <li>Вы имеете все необходимые права для размещения данного контента</li>
              <li>Контент соответствует применимому законодательству</li>
            </ul>
            <p className="leading-relaxed mb-4" style={{ color: 'var(--text-secondary, #cbd5e1)' }}>
              Мы оставляем за собой право удалять любой контент, который нарушает настоящие Условия, 
              без предварительного уведомления.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--text-primary, #f1f5f9)' }}>
              4. Интеллектуальная собственность
            </h2>
            <p className="leading-relaxed mb-4" style={{ color: 'var(--text-secondary, #cbd5e1)' }}>
              Весь контент Сайта, включая, но не ограничиваясь: дизайн, тексты, изображения, логотипы, 
              графические элементы, программный код, базы данных, защищён авторским правом и другими 
              правами интеллектуальной собственности.
            </p>
            <p className="leading-relaxed mb-4" style={{ color: 'var(--text-secondary, #cbd5e1)' }}>
              Использование материалов Сайта (копирование, распространение, модификация, публикация) 
              без письменного разрешения администрации Сайта запрещено, за исключением случаев, 
              предусмотренных законодательством об авторском праве.
            </p>
            <p className="leading-relaxed mb-4" style={{ color: 'var(--text-secondary, #cbd5e1)' }}>
              Вы можете использовать материалы Сайта только для личных, некоммерческих целей. 
              Любое коммерческое использование материалов Сайта требует предварительного письменного разрешения.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--text-primary, #f1f5f9)' }}>
              5. Ограничение ответственности
            </h2>
            <p className="leading-relaxed mb-4" style={{ color: 'var(--text-secondary, #cbd5e1)' }}>
              Сайт предоставляется «как есть» и «как доступно». Мы не гарантируем:
            </p>
            <ul className="list-disc list-inside space-y-2 mb-4" style={{ color: 'var(--text-secondary, #cbd5e1)' }}>
              <li>Бесперебойную и безошибочную работу Сайта</li>
              <li>Отсутствие технических сбоев, ошибок или перерывов в работе</li>
              <li>Полноту, точность и актуальность всей информации на Сайте</li>
              <li>Отсутствие вирусов или вредоносного программного обеспечения</li>
            </ul>
            <p className="leading-relaxed mb-4" style={{ color: 'var(--text-secondary, #cbd5e1)' }}>
              Мы не несём ответственности за:
            </p>
            <ul className="list-disc list-inside space-y-2 mb-4" style={{ color: 'var(--text-secondary, #cbd5e1)' }}>
              <li>Любые прямые, косвенные, случайные или последующие убытки, возникшие в результате использования Сайта</li>
              <li>Потерю данных, упущенную выгоду или прерывание деятельности</li>
              <li>Действия третьих лиц, включая взлом, вирусы или вредоносное программное обеспечение</li>
              <li>Контент, размещённый пользователями на Сайте</li>
              <li>Ссылки на внешние ресурсы, размещённые на Сайте</li>
            </ul>
            <p className="leading-relaxed mb-4" style={{ color: 'var(--text-secondary, #cbd5e1)' }}>
              Информация на Сайте предоставляется в ознакомительных целях и может содержать неточности. 
              Мы не гарантируем достоверность информации, полученной из внешних источников.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--text-primary, #f1f5f9)' }}>
              6. Модерация контента
            </h2>
            <p className="leading-relaxed mb-4" style={{ color: 'var(--text-secondary, #cbd5e1)' }}>
              Мы оставляем за собой право модерировать, редактировать, перемещать или удалять любой контент, 
              размещённый пользователями, если он:
            </p>
            <ul className="list-disc list-inside space-y-2 mb-4" style={{ color: 'var(--text-secondary, #cbd5e1)' }}>
              <li>Нарушает настоящие Условия использования</li>
              <li>Нарушает применимое законодательство</li>
              <li>Содержит оскорбительный, клеветнический или дискриминационный контент</li>
              <li>Нарушает права интеллектуальной собственности</li>
              <li>Содержит спам или рекламу</li>
              <li>Является нежелательным или неуместным по нашему усмотрению</li>
            </ul>
            <p className="leading-relaxed mb-4" style={{ color: 'var(--text-secondary, #cbd5e1)' }}>
              Модерация может осуществляться как до, так и после публикации контента. 
              Мы не обязаны уведомлять пользователей о причинах модерации или удаления контента, 
              но можем сделать это по своему усмотрению.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--text-primary, #f1f5f9)' }}>
              7. Аккаунт пользователя
            </h2>
            <p className="leading-relaxed mb-4" style={{ color: 'var(--text-secondary, #cbd5e1)' }}>
              При регистрации на Сайте вы обязуетесь:
            </p>
            <ul className="list-disc list-inside space-y-2 mb-4" style={{ color: 'var(--text-secondary, #cbd5e1)' }}>
              <li>Предоставлять достоверную и актуальную информацию</li>
              <li>Поддерживать безопасность вашего аккаунта и пароля</li>
              <li>Нести ответственность за все действия, совершённые под вашим аккаунтом</li>
              <li>Немедленно уведомлять нас о любом несанкционированном использовании вашего аккаунта</li>
            </ul>
            <p className="leading-relaxed mb-4" style={{ color: 'var(--text-secondary, #cbd5e1)' }}>
              Мы оставляем за собой право заблокировать, приостановить или удалить ваш аккаунт в случае:
            </p>
            <ul className="list-disc list-inside space-y-2 mb-4" style={{ color: 'var(--text-secondary, #cbd5e1)' }}>
              <li>Нарушения настоящих Условий использования</li>
              <li>Нарушения применимого законодательства</li>
              <li>Длительного неиспользования аккаунта (более 2 лет)</li>
              <li>По запросу правоохранительных органов</li>
            </ul>
            <p className="leading-relaxed mb-4" style={{ color: 'var(--text-secondary, #cbd5e1)' }}>
              Блокировка или удаление аккаунта может быть осуществлена без предварительного уведомления 
              в случае серьёзных нарушений.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--text-primary, #f1f5f9)' }}>
              8. Виртуальная валюта и покупки
            </h2>
            <p className="leading-relaxed mb-4" style={{ color: 'var(--text-secondary, #cbd5e1)' }}>
              Сайт использует систему виртуальной валюты (монеты) для покупки предметов кастомизации. 
              Монеты не являются реальными деньгами и не могут быть обменены на реальную валюту.
            </p>
            <p className="leading-relaxed mb-4" style={{ color: 'var(--text-secondary, #cbd5e1)' }}>
              Мы оставляем за собой право:
            </p>
            <ul className="list-disc list-inside space-y-2 mb-4" style={{ color: 'var(--text-secondary, #cbd5e1)' }}>
              <li>Изменять цены на предметы в магазине</li>
              <li>Добавлять, изменять или удалять предметы из магазина</li>
              <li>Изменять способы получения монет</li>
              <li>Аннулировать монеты в случае нарушения Условий использования</li>
            </ul>
            <p className="leading-relaxed mb-4" style={{ color: 'var(--text-secondary, #cbd5e1)' }}>
              Все покупки в магазине являются окончательными и не подлежат возврату, 
              за исключением случаев технических ошибок.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--text-primary, #f1f5f9)' }}>
              9. Изменения в Условиях использования
            </h2>
            <p className="leading-relaxed mb-4" style={{ color: 'var(--text-secondary, #cbd5e1)' }}>
              Мы оставляем за собой право изменять настоящие Условия использования в любое время. 
              О существенных изменениях мы уведомим пользователей через Сайт, по email или другими способами.
            </p>
            <p className="leading-relaxed mb-4" style={{ color: 'var(--text-secondary, #cbd5e1)' }}>
              Продолжая использовать Сайт после внесения изменений, вы соглашаетесь с новой редакцией 
              Условий использования. Если вы не согласны с изменениями, вы должны прекратить использование Сайта.
            </p>
            <p className="leading-relaxed mb-4" style={{ color: 'var(--text-secondary, #cbd5e1)' }}>
              Рекомендуем периодически просматривать эту страницу для ознакомления с актуальной версией Условий.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--text-primary, #f1f5f9)' }}>
              10. Применимое право и разрешение споров
            </h2>
            <p className="leading-relaxed mb-4" style={{ color: 'var(--text-secondary, #cbd5e1)' }}>
              Настоящие Условия использования регулируются законодательством Российской Федерации. 
              Все споры, возникающие в связи с использованием Сайта, подлежат разрешению в соответствии 
              с законодательством Российской Федерации.
            </p>
            <p className="leading-relaxed mb-4" style={{ color: 'var(--text-secondary, #cbd5e1)' }}>
              В случае возникновения споров стороны обязуются приложить все усилия для их разрешения 
              путём переговоров. Если спор не может быть разрешён путём переговоров, он подлежит 
              рассмотрению в суде по месту нахождения администрации Сайта.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--text-primary, #f1f5f9)' }}>
              11. Контакты
            </h2>
            <p className="leading-relaxed mb-4" style={{ color: 'var(--text-secondary, #cbd5e1)' }}>
              По всем вопросам, связанным с настоящими Условиями использования, вы можете связаться с нами:
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

