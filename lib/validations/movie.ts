import { z } from "zod";

export const movieSchema = z.object({
  title: z.string().min(1, "Название обязательно"),
  originalTitle: z.string().optional(),
  description: z.string().optional(),
  poster: z.string().url("Неверный URL постера").optional().or(z.literal("")),
  backdrop: z.string().url("Неверный URL обложки").optional().or(z.literal("")),
  trailer: z.string().url("Неверный URL трейлера").optional().or(z.literal("")),
  releaseDate: z.string().optional(),
  runtime: z.coerce.number().int().positive().optional(),
  budget: z.coerce.number().int().nonnegative().optional(),
  revenue: z.coerce.number().int().nonnegative().optional(),
  country: z.string().optional(),
  directorId: z.string().optional(),
  genreIds: z.array(z.string()).optional(),
  actorIds: z.array(z.string()).optional(),
});

export type MovieFormData = z.infer<typeof movieSchema>;

export const reviewSchema = z.object({
  content: z.string().min(10, "Отзыв должен содержать минимум 10 символов"),
  rating: z.coerce.number().int().min(1, "Минимальный рейтинг — 1").max(10, "Максимальный рейтинг — 10"),
});

export type ReviewFormData = z.infer<typeof reviewSchema>;

export const userSchema = z.object({
  name: z.string().min(2, "Имя должно содержать минимум 2 символа"),
  email: z.string().email("Неверный формат email"),
  password: z.string().min(6, "Пароль должен содержать минимум 6 символов"),
});

export type UserFormData = z.infer<typeof userSchema>;

export const loginSchema = z.object({
  email: z.string().email("Неверный формат email"),
  password: z.string().min(1, "Введите пароль"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const articleSchema = z.object({
  title: z.string().min(1, "Заголовок обязателен"),
  slug: z.string().min(1, "URL обязателен").regex(/^[a-z0-9-]+$/, "URL может содержать только латинские буквы, цифры и дефисы"),
  content: z.string().min(100, "Содержание должно быть минимум 100 символов"),
  excerpt: z.string().optional(),
  cover: z.string().url("Неверный URL обложки").optional().or(z.literal("")),
  category: z.enum(["NEWS", "INTERVIEW", "REVIEW", "FEATURE"]),
  published: z.boolean().default(false),
});

export type ArticleFormData = z.infer<typeof articleSchema>;

export const actorSchema = z.object({
  name: z.string().min(1, "Имя обязательно"),
  bio: z.string().optional(),
  photo: z.string().url("Неверный URL фото").optional().or(z.literal("")),
  birthDate: z.string().optional(),
  birthPlace: z.string().optional(),
  deathDate: z.string().optional(),
});

export type ActorFormData = z.infer<typeof actorSchema>;

export const directorSchema = z.object({
  name: z.string().min(1, "Имя обязательно"),
  bio: z.string().optional(),
  photo: z.string().url("Неверный URL фото").optional().or(z.literal("")),
  birthDate: z.string().optional(),
  birthPlace: z.string().optional(),
  deathDate: z.string().optional(),
});

export type DirectorFormData = z.infer<typeof directorSchema>;

export const genreSchema = z.object({
  name: z.string().min(1, "Название обязательно"),
  slug: z.string().min(1, "URL обязателен").regex(/^[a-z0-9-]+$/, "URL может содержать только латинские буквы, цифры и дефисы"),
  description: z.string().optional(),
});

export type GenreFormData = z.infer<typeof genreSchema>;

