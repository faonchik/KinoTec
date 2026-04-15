/**
 * Утилиты для проверки reCAPTCHA v3 на сервере
 */

const RECAPTCHA_SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY;
const RECAPTCHA_VERIFY_URL = "https://www.google.com/recaptcha/api/siteverify";

/**
 * Проверяет токен reCAPTCHA v3 на сервере Google
 * v3 возвращает score от 0.0 до 1.0, где 1.0 - это человек, 0.0 - бот
 */
export async function verifyRecaptcha(token: string | null | undefined): Promise<boolean> {
  if (!token) {
    return false;
  }

  if (!RECAPTCHA_SECRET_KEY) {
    console.warn("RECAPTCHA_SECRET_KEY не настроен, пропускаем проверку");
    return false;
  }

  try {
    const response = await fetch(RECAPTCHA_VERIFY_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `secret=${encodeURIComponent(RECAPTCHA_SECRET_KEY)}&response=${encodeURIComponent(token)}`,
    });

    const data = await response.json();

    // Проверяем success
    if (data.success !== true) {
      console.warn("reCAPTCHA проверка не прошла:", data);
      return false;
    }

    // Для reCAPTCHA v3 проверяем score (порог 0.5)
    if (data.score !== undefined) {
      const score = parseFloat(data.score);
      if (score < 0.5) {
        console.warn(`reCAPTCHA score слишком низкий: ${score}`);
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error("Ошибка при проверке reCAPTCHA:", error);
    return false;
  }
}

