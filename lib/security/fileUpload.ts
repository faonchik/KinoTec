// Защита загрузки файлов

import { logSecurityEvent } from "./logger";

// Разрешённые MIME типы
export const ALLOWED_MIME_TYPES = {
  image: ["image/jpeg", "image/png", "image/webp", "image/gif"],
  document: ["application/pdf"],
};

// Максимальные размеры файлов
export const MAX_FILE_SIZES = {
  avatar: 2 * 1024 * 1024, // 2 MB
  poster: 5 * 1024 * 1024, // 5 MB
  document: 10 * 1024 * 1024, // 10 MB
};

// Проверка MIME типа
export function validateMimeType(
  mimeType: string,
  allowedTypes: string[]
): boolean {
  return allowedTypes.includes(mimeType);
}

// Проверка размера файла
export function validateFileSize(
  size: number,
  maxSize: number
): { valid: boolean; error?: string } {
  if (size > maxSize) {
    return {
      valid: false,
      error: `File too large. Maximum size: ${Math.round(maxSize / 1024 / 1024)}MB`,
    };
  }

  if (size === 0) {
    return {
      valid: false,
      error: "File is empty",
    };
  }

  return { valid: true };
}

// Проверка расширения файла
export function validateFileExtension(
  filename: string,
  allowedExtensions: string[]
): boolean {
  const ext = filename.split(".").pop()?.toLowerCase();
  if (!ext) return false;
  return allowedExtensions.includes(ext);
}

// Валидация загружаемого файла
export function validateFileUpload(
  file: {
    name: string;
    size: number;
    type: string;
  },
  config: {
    maxSize: number;
    allowedMimeTypes: string[];
    allowedExtensions: string[];
  },
  request?: Request
): { valid: boolean; error?: string } {
  // Проверка размера
  const sizeCheck = validateFileSize(file.size, config.maxSize);
  if (!sizeCheck.valid) {
    if (request) {
      logSecurityEvent(
        "SUSPICIOUS_ACTIVITY",
        "medium",
        `File upload size violation: ${file.size} bytes`,
        { filename: file.name, size: file.size, maxSize: config.maxSize },
        request
      );
    }
    return sizeCheck;
  }

  // Проверка MIME типа
  if (!validateMimeType(file.type, config.allowedMimeTypes)) {
    if (request) {
      logSecurityEvent(
        "SUSPICIOUS_ACTIVITY",
        "high",
        `File upload MIME type violation: ${file.type}`,
        { filename: file.name, mimeType: file.type },
        request
      );
    }
    return {
      valid: false,
      error: `File type not allowed. Allowed types: ${config.allowedMimeTypes.join(", ")}`,
    };
  }

  // Проверка расширения
  if (!validateFileExtension(file.name, config.allowedExtensions)) {
    if (request) {
      logSecurityEvent(
        "SUSPICIOUS_ACTIVITY",
        "high",
        `File upload extension violation: ${file.name}`,
        { filename: file.name },
        request
      );
    }
    return {
      valid: false,
      error: `File extension not allowed. Allowed extensions: ${config.allowedExtensions.join(", ")}`,
    };
  }

  // Проверка имени файла на опасные символы
  const dangerousChars = /[<>:"|?*\x00-\x1f]/;
  if (dangerousChars.test(file.name)) {
    if (request) {
      logSecurityEvent(
        "SUSPICIOUS_ACTIVITY",
        "high",
        `File upload with dangerous filename: ${file.name}`,
        { filename: file.name },
        request
      );
    }
    return {
      valid: false,
      error: "Filename contains dangerous characters",
    };
  }

  return { valid: true };
}

