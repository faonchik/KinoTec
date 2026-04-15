// Санитизация HTML для защиты от XSS

export function sanitizeHtml(html: string): string {
  // Простая санитизация - удаляем все теги и оставляем только текст
  // Для более сложной логики можно использовать библиотеку DOMPurify
  const sanitized = html
    // Удаляем script теги
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    // Удаляем iframe теги
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
    // Удаляем object теги
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, "")
    // Удаляем embed теги
    .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, "")
    // Удаляем javascript: протоколы
    .replace(/javascript:/gi, "")
    // Удаляем on* события
    .replace(/\son\w+\s*=\s*["'][^"']*["']/gi, "")
    // Экранируем HTML символы
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");

  return sanitized;
}

// Санитизация текста (удаление всех HTML тегов)
export function sanitizeText(text: string): string {
  return text
    .replace(/<[^>]*>/g, "") // Удаляем все HTML теги
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .trim();
}

// Валидация длины контента
export function validateContentLength(content: string, maxLength: number = 10000): boolean {
  return content.length <= maxLength && content.length > 0;
}

// Валидация email
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Валидация URL
export function validateUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ["http:", "https:"].includes(parsed.protocol);
  } catch {
    return false;
  }
}

// Ограничение длины строки
export function truncateString(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength - 3) + "...";
}

