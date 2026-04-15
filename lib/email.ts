import nodemailer from "nodemailer";
import crypto from "crypto";

// Создаем транспортер для Gmail SMTP
const createTransporter = () => {
  // Gmail SMTP настройки
  const smtpHost = process.env.SMTP_HOST || process.env.GMAIL_SMTP_HOST || "smtp.gmail.com";
  // По умолчанию используем порт 587 (TLS), а не 465 (SSL)
  const smtpPort = parseInt(process.env.SMTP_PORT || process.env.GMAIL_SMTP_PORT || "587");
  const smtpUser = process.env.SMTP_USER || process.env.GMAIL_USER;
  const smtpPassword = process.env.SMTP_PASS || process.env.SMTP_PASSWORD || process.env.GMAIL_APP_PASSWORD;
  // Для Gmail порт 587 использует STARTTLS (secure: false), порт 465 использует SSL (secure: true)
  const smtpSecure = smtpPort === 465;
  const smtpFrom = process.env.SMTP_FROM || process.env.GMAIL_FROM || smtpUser;

  if (!smtpUser || !smtpPassword) {
    console.warn("Gmail SMTP credentials not configured. Email sending will be disabled.");
    return null;
  }

  console.log("📧 Creating Gmail SMTP transporter:", {
    host: smtpHost,
    port: smtpPort,
    secure: smtpSecure,
    user: smtpUser.substring(0, 3) + "***",
  });

  return nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpSecure, // true для 465 (SSL), false для 587 (STARTTLS)
    requireTLS: !smtpSecure, // Требуем TLS для порта 587
    auth: {
      user: smtpUser,
      pass: smtpPassword, // Должен быть пароль приложения Gmail (App Password)
    },
    connectionTimeout: 10000, // 10 секунд на подключение
    greetingTimeout: 10000, // 10 секунд на приветствие
    socketTimeout: 10000, // 10 секунд на операции
    tls: {
      // Не отклоняем самоподписанные сертификаты (для разработки)
      rejectUnauthorized: false,
      minVersion: "TLSv1.2",
    },
  });
};

/**
 * Отправляет email с токеном для сброса пароля
 */
export async function sendPasswordResetEmail(
  email: string,
  resetToken: string,
  userName?: string
): Promise<void> {
  // Получаем порт из переменных окружения для сообщений об ошибках
  const smtpPort = parseInt(process.env.SMTP_PORT || process.env.GMAIL_SMTP_PORT || "587");
  
  const transporter = createTransporter();
  
  if (!transporter) {
    throw new Error("Email service is not configured");
  }

  const resetUrl = `${process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/auth/reset-password?token=${resetToken}`;

  const smtpFrom = process.env.SMTP_FROM || process.env.GMAIL_FROM || process.env.SMTP_USER || process.env.GMAIL_USER;

  const mailOptions = {
    from: smtpFrom,
    to: email,
    subject: "Сброс пароля - КиноТека",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f5f5f5;
            }
            .container {
              background-color: #ffffff;
              border-radius: 8px;
              padding: 30px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .logo {
              font-size: 28px;
              font-weight: bold;
              background: linear-gradient(135deg, #f59e0b, #ea580c);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
              background-clip: text;
            }
            .content {
              margin-bottom: 30px;
            }
            .button {
              display: inline-block;
              padding: 12px 30px;
              background: linear-gradient(135deg, #f59e0b, #ea580c);
              color: #ffffff;
              text-decoration: none;
              border-radius: 6px;
              font-weight: 600;
              text-align: center;
              margin: 20px 0;
            }
            .button:hover {
              opacity: 0.9;
            }
            .footer {
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #e5e5e5;
              font-size: 12px;
              color: #666;
              text-align: center;
            }
            .token {
              background-color: #f9fafb;
              border: 1px solid #e5e7eb;
              border-radius: 4px;
              padding: 15px;
              font-family: monospace;
              word-break: break-all;
              margin: 20px 0;
              font-size: 12px;
              color: #374151;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">КиноТека</div>
            </div>
            <div class="content">
              <h2>Сброс пароля</h2>
              ${userName ? `<p>Привет, ${userName}!</p>` : ""}
              <p>Вы запросили сброс пароля для вашего аккаунта. Нажмите на кнопку ниже, чтобы установить новый пароль:</p>
              <div style="text-align: center;">
                <a href="${resetUrl}" class="button">Сбросить пароль</a>
              </div>
              <p>Или скопируйте и вставьте эту ссылку в браузер:</p>
              <div class="token">${resetUrl}</div>
              <p><strong>Важно:</strong> Эта ссылка действительна в течение 1 часа. Если вы не запрашивали сброс пароля, просто проигнорируйте это письмо.</p>
            </div>
            <div class="footer">
              <p>Это автоматическое письмо, пожалуйста, не отвечайте на него.</p>
              <p>&copy; ${new Date().getFullYear()} КиноТека. Все права защищены.</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
Сброс пароля - КиноТека

${userName ? `Привет, ${userName}!\n\n` : ""}Вы запросили сброс пароля для вашего аккаунта.

Перейдите по ссылке, чтобы установить новый пароль:
${resetUrl}

Важно: Эта ссылка действительна в течение 1 часа. Если вы не запрашивали сброс пароля, просто проигнорируйте это письмо.

---
Это автоматическое письмо, пожалуйста, не отвечайте на него.
© ${new Date().getFullYear()} КиноТека. Все права защищены.
    `.trim(),
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Password reset email sent to ${email}`);
  } catch (error) {
    console.error("❌ Error sending password reset email:", error);
    
    // Детальная информация об ошибке
    if (error && typeof error === "object" && "code" in error) {
      const errorCode = error.code as string;
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      console.error("Error details:", {
        code: errorCode,
        message: errorMessage,
        command: "command" in error ? error.command : undefined,
        response: "response" in error ? error.response : undefined,
        responseCode: "responseCode" in error ? error.responseCode : undefined,
      });
      
      // Специфичные ошибки Gmail
      if (errorCode === "EAUTH") {
        throw new Error("Ошибка аутентификации Gmail. Проверьте email и пароль приложения.");
      }
      if (errorCode === "ECONNECTION" || errorCode === "ETIMEDOUT" || errorMessage.includes("ETIMEDOUT")) {
        const portHint = smtpPort === 465 
          ? "Используется порт 465 (SSL), который может быть заблокирован. Рекомендуется использовать порт 587 (TLS)."
          : `Порт ${smtpPort} может быть заблокирован файрволом или провайдером.`;
        throw new Error(`Не удалось подключиться к Gmail SMTP (порт ${smtpPort}). ${portHint} Проверьте интернет-соединение и настройки файрвола. Если используете порт 465, попробуйте изменить SMTP_PORT=587 в .env файле.`);
      }
      if (errorMessage.includes("Invalid login")) {
        throw new Error("Неверный email или пароль приложения Gmail.");
      }
      if (errorMessage.includes("Application-specific password")) {
        throw new Error("Используйте пароль приложения Gmail (App Password), а не обычный пароль.");
      }
      if (errorMessage.includes("timeout") || errorMessage.includes("TIMEDOUT")) {
        const portHint = smtpPort === 465 
          ? "Порт 465 часто блокируется. Рекомендуется использовать порт 587 (TLS). Добавьте SMTP_PORT=587 в .env файл."
          : `Проверьте, что порт ${smtpPort} не заблокирован файрволом.`;
        throw new Error(`Таймаут подключения к Gmail (порт ${smtpPort}). ${portHint}`);
      }
    }
    
    throw new Error(`Не удалось отправить email: ${error instanceof Error ? error.message : "Неизвестная ошибка"}`);
  }
}

/**
 * Отправляет произвольный email
 */
export async function sendEmail(options: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}): Promise<void> {
  const transporter = createTransporter();
  
  if (!transporter) {
    throw new Error("Email service is not configured");
  }

  const smtpFrom = process.env.SMTP_FROM || process.env.GMAIL_FROM || process.env.SMTP_USER || process.env.GMAIL_USER;

  const mailOptions = {
    from: smtpFrom,
    to: options.to,
    subject: options.subject,
    html: options.html,
    text: options.text || options.html.replace(/<[^>]*>/g, ""),
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${options.to}`);
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Не удалось отправить email");
  }
}

/**
 * Генерирует криптографически безопасный токен для сброса пароля
 */
export function generateResetToken(): string {
  return crypto.randomBytes(32).toString("hex");
}
