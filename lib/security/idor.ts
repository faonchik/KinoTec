// Защита от IDOR (Insecure Direct Object Reference)

import prisma from "@/lib/prisma";
import { logSecurityEvent } from "./logger";

// Проверка доступа пользователя к ресурсу
export async function checkResourceAccess(
  resourceType: "movie" | "series" | "user" | "collection" | "review" | "comment",
  resourceId: string,
  userId: string,
  request?: Request
): Promise<boolean> {
  try {
    switch (resourceType) {
      case "movie":
      case "series":
        // Фильмы и сериалы доступны всем
        return true;

      case "user":
        // Пользователь может видеть только свой профиль (или публичные данные)
        return resourceId === userId;

      case "collection":
        const collection = await prisma.collection.findUnique({
          where: { id: resourceId },
          select: { userId: true, isPublic: true },
        });
        if (!collection) return false;
        return collection.isPublic || collection.userId === userId;

      case "review":
        const review = await prisma.review.findUnique({
          where: { id: resourceId },
          select: { userId: true, isApproved: true },
        });
        if (!review) return false;
        // Пользователь может видеть свой отзыв или одобренные отзывы
        return review.userId === userId || review.isApproved;

      case "comment":
        const comment = await prisma.movieComment.findUnique({
          where: { id: resourceId },
          select: { userId: true },
        }).catch(() => 
          prisma.seriesComment.findUnique({
            where: { id: resourceId },
            select: { userId: true },
          })
        );
        if (!comment) return false;
        // Комментарии видны всем, но редактировать может только автор
        return true;

      default:
        return false;
    }
  } catch (error) {
    console.error("Check resource access error:", error);
    return false;
  }
}

// Проверка прав на изменение ресурса
export async function checkResourceModification(
  resourceType: "movie" | "series" | "user" | "collection" | "review" | "comment",
  resourceId: string,
  userId: string,
  request?: Request
): Promise<boolean> {
  try {
    switch (resourceType) {
      case "movie":
      case "series":
        // Только админы могут изменять фильмы/сериалы
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { role: true },
        });
        return user?.role === "ADMIN" || user?.role === "MODERATOR";

      case "user":
        // Пользователь может изменять только свой профиль
        return resourceId === userId;

      case "collection":
        const collection = await prisma.collection.findUnique({
          where: { id: resourceId },
          select: { userId: true },
        });
        if (!collection) {
          if (request) {
            logSecurityEvent(
              "IDOR_ATTEMPT",
              "high",
              `Attempt to modify non-existent collection: ${resourceId}`,
              { userId, resourceId, resourceType },
              request
            );
          }
          return false;
        }
        if (collection.userId !== userId) {
          if (request) {
            logSecurityEvent(
              "IDOR_ATTEMPT",
              "high",
              `Attempt to modify another user's collection: ${resourceId}`,
              { userId, resourceId, resourceType, ownerId: collection.userId },
              request
            );
          }
          return false;
        }
        return true;

      case "review":
        const review = await prisma.review.findUnique({
          where: { id: resourceId },
          select: { userId: true },
        });
        if (!review) return false;
        if (review.userId !== userId) {
          if (request) {
            logSecurityEvent(
              "IDOR_ATTEMPT",
              "high",
              `Attempt to modify another user's review: ${resourceId}`,
              { userId, resourceId, resourceType, ownerId: review.userId },
              request
            );
          }
          return false;
        }
        return true;

      case "comment":
        const comment = await prisma.movieComment.findUnique({
          where: { id: resourceId },
          select: { userId: true },
        }).catch(() => 
          prisma.seriesComment.findUnique({
            where: { id: resourceId },
            select: { userId: true },
          })
        );
        if (!comment) return false;
        if (comment.userId !== userId) {
          if (request) {
            logSecurityEvent(
              "IDOR_ATTEMPT",
              "medium",
              `Attempt to modify another user's comment: ${resourceId}`,
              { userId, resourceId, resourceType },
              request
            );
          }
          return false;
        }
        return true;

      default:
        return false;
    }
  } catch (error) {
    console.error("Check resource modification error:", error);
    return false;
  }
}

