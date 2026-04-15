import { z } from "zod";

// Схемы валидации для различных типов данных

export const commentSchema = z.object({
  content: z.string().min(3, "Минимум 3 символа").max(5000, "Максимум 5000 символов"),
  parentId: z.string().optional().nullable(),
});

export const reviewSchema = z.object({
  content: z.string().min(10, "Минимум 10 символов").max(10000, "Максимум 10000 символов"),
  rating: z.number().int().min(1).max(10),
});

export const ratingSchema = z.object({
  value: z.number().int().min(1).max(10),
});

export const collectionSchema = z.object({
  title: z.string().min(1, "Название обязательно").max(100, "Максимум 100 символов"),
  description: z.string().max(500, "Максимум 500 символов").optional().nullable(),
  cover: z.string().url().optional().nullable(),
  isPublic: z.boolean().optional().default(false),
  movieIds: z.array(z.string()).optional().default([]),
});

export const searchSchema = z.object({
  query: z.string().min(1).max(100),
  page: z.number().int().min(1).max(100).optional().default(1),
  limit: z.number().int().min(1).max(100).optional().default(20),
});

// Валидация ID (CUID формат)
export function validateId(id: string): boolean {
  return /^c[a-z0-9]{24}$/.test(id);
}

// Валидация email
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 255;
}

// Валидация пароля
export function validatePassword(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (password.length < 6) {
    errors.push("Пароль должен быть минимум 6 символов");
  }
  if (password.length > 128) {
    errors.push("Пароль должен быть максимум 128 символов");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

