import { Metadata } from "next";
import { getLocale } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  if (locale === "en") {
    return {
      title: "Terms of Service | KinoTeka",
      description: "Terms of Service of KinoTeka",
    };
  }
  return {
    title: "Условия использования | КиноТека",
    description: "Условия использования КиноТека",
  };
}

export const dynamic = "force-static";

export default async function TermsPage() {
  const locale = await getLocale();

  if (locale === "en") {
    return (
      <div className="min-h-screen py-12" style={{ backgroundColor: 'var(--bg-primary, #0f172a)' }}>
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-4xl font-bold mb-8" style={{ color: 'var(--text-primary, #f1f5f9)' }}>
            Terms of Service
          </h1>
          
          <div className="prose prose-invert max-w-none">
            <section className="mb-8">
              <p className="text-sm mb-6" style={{ color: 'var(--text-muted, #94a3b8)' }}>
                Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
              </p>
              
              <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--text-primary, #f1f5f9)' }}>
                1. Acceptance of Terms
              </h2>
              <p className="leading-relaxed mb-4" style={{ color: 'var(--text-secondary, #cbd5e1)' }}>
                By using the KinoTeka website (hereinafter referred to as the "Website"), you agree to these Terms of Service.
                If you do not agree to any terms, please do not use the Website.
              </p>
              <p className="leading-relaxed mb-4" style={{ color: 'var(--text-secondary, #cbd5e1)' }}>
                These Terms of Service (hereinafter referred to as the "Terms") govern the relationship between the Website administration
                and the users. By using the Website, you confirm that you have read, understood, and agree to comply
                with all provisions of these Terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--text-primary, #f1f5f9)' }}>
                2. Use of the Website
              </h2>
              <p className="leading-relaxed mb-4" style={{ color: 'var(--text-secondary, #cbd5e1)' }}>
                You agree to use the Website only for lawful purposes and in accordance with these Terms,
                as well as applicable law. When using the Website, it is prohibited to:
              </p>
              <ul className="list-disc list-inside space-y-2 mb-4" style={{ color: 'var(--text-secondary, #cbd5e1)' }}>
                <li>Post illegal, offensive, defamatory, discriminatory, or harmful content</li>
                <li>Violate intellectual property rights of third parties</li>
                <li>Attempt to gain unauthorized access to systems, data, or accounts of other users</li>
                <li>Use automated tools (bots, scripts) to collect data without written permission</li>
                <li>Create fake accounts, impersonate another person or organization</li>
                <li>Distribute spam, advertisements, or unsolicited messages</li>
                <li>Use the Website for any illegal or fraudulent purposes</li>
                <li>Disrupt the Website operation or attempt to hack its security systems</li>
                <li>Collect or store personal data of other users without their consent</li>
              </ul>
              <p className="leading-relaxed mb-4" style={{ color: 'var(--text-secondary, #cbd5e1)' }}>
                Violation of any of these prohibitions may lead to account suspension,
                content deletion, and liability in accordance with applicable law.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--text-primary, #f1f5f9)' }}>
                3. User Content
              </h2>
              <p className="leading-relaxed mb-4" style={{ color: 'var(--text-secondary, #cbd5e1)' }}>
                By posting content on the Website (reviews, comments, ratings, lists, images),
                you grant us a non-exclusive, royalty-free, perpetual license to use,
                reproduce, distribute, modify, and moderate this content in connection with the Website operation.
              </p>
              <p className="leading-relaxed mb-4" style={{ color: 'var(--text-secondary, #cbd5e1)' }}>
                You are solely responsible for the content posted and warrant that:
              </p>
              <ul className="list-disc list-inside space-y-2 mb-4" style={{ color: 'var(--text-secondary, #cbd5e1)' }}>
                <li>The content does not violate intellectual property rights of third parties</li>
                <li>The content does not contain illegal, offensive, or defamatory information</li>
                <li>You have all necessary rights to post this content</li>
                <li>The content complies with applicable law</li>
              </ul>
              <p className="leading-relaxed mb-4" style={{ color: 'var(--text-secondary, #cbd5e1)' }}>
                We reserve the right to delete any content that violates these Terms
                without prior notice.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--text-primary, #f1f5f9)' }}>
                4. Intellectual Property
              </h2>
              <p className="leading-relaxed mb-4" style={{ color: 'var(--text-secondary, #cbd5e1)' }}>
                All content on the Website, including but not limited to: design, text, images, logos,
                graphics, software code, databases, is protected by copyright and other
                intellectual property rights.
              </p>
              <p className="leading-relaxed mb-4" style={{ color: 'var(--text-secondary, #cbd5e1)' }}>
                Use of the Website materials (copying, distribution, modification, publication)
                without written permission of the Website administration is prohibited, except in cases
                provided by copyright law.
              </p>
              <p className="leading-relaxed mb-4" style={{ color: 'var(--text-secondary, #cbd5e1)' }}>
                You may use the Website materials only for personal, non-commercial purposes.
                Any commercial use of the Website materials requires prior written permission.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--text-primary, #f1f5f9)' }}>
                5. Limitation of Liability
              </h2>
              <p className="leading-relaxed mb-4" style={{ color: 'var(--text-secondary, #cbd5e1)' }}>
                The Website is provided on an "as is" and "as available" basis. We do not warrant:
              </p>
              <ul className="list-disc list-inside space-y-2 mb-4" style={{ color: 'var(--text-secondary, #cbd5e1)' }}>
                <li>Uninterrupted and error-free operation of the Website</li>
                <li>Absence of technical failures, errors, or interruptions in operation</li>
                <li>Completeness, accuracy, and relevance of all information on the Website</li>
                <li>Absence of viruses or malicious software</li>
              </ul>
              <p className="leading-relaxed mb-4" style={{ color: 'var(--text-secondary, #cbd5e1)' }}>
                We are not liable for:
              </p>
              <ul className="list-disc list-inside space-y-2 mb-4" style={{ color: 'var(--text-secondary, #cbd5e1)' }}>
                <li>Any direct, indirect, incidental, or consequential damages resulting from the use of the Website</li>
                <li>Loss of data, lost profits, or business interruption</li>
                <li>Actions of third parties, including hacking, viruses, or malicious software</li>
                <li>Content posted by users on the Website</li>
                <li>Links to external resources posted on the Website</li>
              </ul>
              <p className="leading-relaxed mb-4" style={{ color: 'var(--text-secondary, #cbd5e1)' }}>
                Information on the Website is provided for informational purposes and may contain inaccuracies.
                We do not guarantee the reliability of information obtained from external sources.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--text-primary, #f1f5f9)' }}>
                6. Content Moderation
              </h2>
              <p className="leading-relaxed mb-4" style={{ color: 'var(--text-secondary, #cbd5e1)' }}>
                We reserve the right to moderate, edit, move, or delete any content
                posted by users if it:
              </p>
              <ul className="list-disc list-inside space-y-2 mb-4" style={{ color: 'var(--text-secondary, #cbd5e1)' }}>
                <li>Violates these Terms of Service</li>
                <li>Violates applicable law</li>
                <li>Contains offensive, defamatory, or discriminatory content</li>
                <li>Violates intellectual property rights</li>
                <li>Contains spam or advertisements</li>
                <li>Is undesirable or inappropriate at our discretion</li>
              </ul>
              <p className="leading-relaxed mb-4" style={{ color: 'var(--text-secondary, #cbd5e1)' }}>
                Moderation can be carried out both before and after the content publication.
                We are not obliged to notify users of the reasons for moderating or deleting content,
                but may do so at our discretion.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--text-primary, #f1f5f9)' }}>
                7. User Account
              </h2>
              <p className="leading-relaxed mb-4" style={{ color: 'var(--text-secondary, #cbd5e1)' }}>
                When registering on the Website, you agree to:
              </p>
              <ul className="list-disc list-inside space-y-2 mb-4" style={{ color: 'var(--text-secondary, #cbd5e1)' }}>
                <li>Provide accurate and current information</li>
                <li>Maintain the security of your account and password</li>
                <li>Be responsible for all actions taken under your account</li>
                <li>Immediately notify us of any unauthorized use of your account</li>
              </ul>
              <p className="leading-relaxed mb-4" style={{ color: 'var(--text-secondary, #cbd5e1)' }}>
                We reserve the right to block, suspend, or delete your account in case of:
              </p>
              <ul className="list-disc list-inside space-y-2 mb-4" style={{ color: 'var(--text-secondary, #cbd5e1)' }}>
                <li>Violation of these Terms of Service</li>
                <li>Violation of applicable law</li>
                <li>Prolonged inactivity of the account (more than 2 years)</li>
                <li>At the request of law enforcement agencies</li>
              </ul>
              <p className="leading-relaxed mb-4" style={{ color: 'var(--text-secondary, #cbd5e1)' }}>
                Blocking or deletion of the account may be carried out without prior notice
                in case of serious violations.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--text-primary, #f1f5f9)' }}>
                8. Virtual Currency and Purchases
              </h2>
              <p className="leading-relaxed mb-4" style={{ color: 'var(--text-secondary, #cbd5e1)' }}>
                The Website uses a virtual currency system (coins) to purchase customization items.
                Coins are not real money and cannot be exchanged for real currency.
              </p>
              <p className="leading-relaxed mb-4" style={{ color: 'var(--text-secondary, #cbd5e1)' }}>
                We reserve the right to:
              </p>
              <ul className="list-disc list-inside space-y-2 mb-4" style={{ color: 'var(--text-secondary, #cbd5e1)' }}>
                <li>Change prices for items in the shop</li>
                <li>Add, change, or remove items from the shop</li>
                <li>Change methods for obtaining coins</li>
                <li>Revoke coins in case of violation of these Terms of Service</li>
              </ul>
              <p className="leading-relaxed mb-4" style={{ color: 'var(--text-secondary, #cbd5e1)' }}>
                All purchases in the shop are final and non-refundable,
                except in cases of technical errors.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--text-primary, #f1f5f9)' }}>
                9. Changes to the Terms of Service
              </h2>
              <p className="leading-relaxed mb-4" style={{ color: 'var(--text-secondary, #cbd5e1)' }}>
                We reserve the right to modify these Terms of Service at any time.
                We will notify users of significant changes via the Website, by email, or other means.
              </p>
              <p className="leading-relaxed mb-4" style={{ color: 'var(--text-secondary, #cbd5e1)' }}>
                By continuing to use the Website after changes are made, you agree to the new edition
                of the Terms of Service. If you do not agree to the changes, you must stop using the Website.
              </p>
              <p className="leading-relaxed mb-4" style={{ color: 'var(--text-secondary, #cbd5e1)' }}>
                We recommend periodically reviewing this page to read the current version of the Terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--text-primary, #f1f5f9)' }}>
                10. Governing Law and Dispute Resolution
              </h2>
              <p className="leading-relaxed mb-4" style={{ color: 'var(--text-secondary, #cbd5e1)' }}>
                These Terms of Service are governed by the laws of the Russian Federation.
                All disputes arising in connection with the use of the Website shall be resolved in accordance
                with the laws of the Russian Federation.
              </p>
              <p className="leading-relaxed mb-4" style={{ color: 'var(--text-secondary, #cbd5e1)' }}>
                In case of disputes, the parties commit to make every effort to resolve them
                through negotiations. If a dispute cannot be resolved through negotiations, it shall be
                submitted to the court at the location of the Website administration.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--text-primary, #f1f5f9)' }}>
                11. Contacts
              </h2>
              <p className="leading-relaxed mb-4" style={{ color: 'var(--text-secondary, #cbd5e1)' }}>
                For all questions related to these Terms of Service, you can contact us:
              </p>
              <div className="p-4 rounded-lg mt-4" style={{ backgroundColor: 'var(--bg-secondary, #1e293b)' }}>
                <p className="mb-2" style={{ color: 'var(--text-secondary, #cbd5e1)' }}>
                  <strong style={{ color: 'var(--text-primary, #f1f5f9)' }}>Email:</strong> support@kinoteka.com
                </p>
                <p className="mb-2" style={{ color: 'var(--text-secondary, #cbd5e1)' }}>
                  <strong style={{ color: 'var(--text-primary, #f1f5f9)' }}>Via feedback form:</strong> on the Website
                </p>
              </div>
              <p className="leading-relaxed mt-4" style={{ color: 'var(--text-secondary, #cbd5e1)' }}>
                We commit to review your request in the shortest time possible and provide the necessary information.
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
              you предоставляете нам неисключительную, безвозмездную, бессрочную лицензию на использование, 
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
