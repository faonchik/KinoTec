import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";
import prisma from "./prisma";
import { logSecurityEvent } from "./security/logger";
import { EnumerationMessages } from "./security/enumeration";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Введите email и пароль");
        }

        // Валидация email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(credentials.email)) {
          throw new Error("Неверный формат email");
        }

        // Нормализация email
        const normalizedEmail = credentials.email.toLowerCase().trim();

        // Проверка длины пароля
        if (credentials.password.length < 6 || credentials.password.length > 128) {
          throw new Error("Неверный пароль");
        }

        const user = await prisma.user.findUnique({
          where: { email: normalizedEmail },
        });

        if (!user) {
          // Всегда одинаковое время ответа для защиты от timing attacks
          await bcrypt.compare(credentials.password, "$2a$10$dummyHashForTimingProtection");
          // Используем унифицированное сообщение для защиты от enumeration
          throw new Error(EnumerationMessages.USER_NOT_FOUND);
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          // Логируем неудачную попытку входа
          logSecurityEvent(
            "AUTH_FAILURE",
            "medium",
            `Failed login attempt for email: ${normalizedEmail}`,
            { email: normalizedEmail },
            undefined as any // Request недоступен в authorize
          );
          // Используем унифицированное сообщение
          throw new Error(EnumerationMessages.INVALID_CREDENTIALS);
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          // Не передаём аватар в токен, чтобы не превысить лимит размера cookies
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 дней
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        // Не храним аватар в токене - он слишком большой для cookies
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
        // Аватар загружается отдельно через API, чтобы не превысить лимит cookies
        session.user.image = null;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

