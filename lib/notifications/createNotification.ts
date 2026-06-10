import prisma from "@/lib/prisma";
import type { NotificationType } from "@prisma/client";

/**
 * Create a notification for a specific user.
 */
export async function createNotification({
  userId,
  type,
  title,
  message,
  link,
  seriesId,
}: {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  seriesId?: string;
}) {
  return prisma.notification.create({
    data: {
      userId,
      type,
      title,
      message,
      link: link ?? null,
      seriesId: seriesId ?? null,
    },
  });
}

/**
 * Send a notification to ALL users (e.g. new movie release).
 * Batches in chunks of 100 for performance.
 */
export async function notifyAllUsers({
  type,
  title,
  message,
  link,
  seriesId,
}: {
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  seriesId?: string;
}) {
  const users = await prisma.user.findMany({
    select: { id: true },
  });

  const BATCH_SIZE = 100;
  let created = 0;

  for (let i = 0; i < users.length; i += BATCH_SIZE) {
    const batch = users.slice(i, i + BATCH_SIZE);
    await prisma.notification.createMany({
      data: batch.map((u) => ({
        userId: u.id,
        type,
        title,
        message,
        link: link ?? null,
        seriesId: seriesId ?? null,
      })),
    });
    created += batch.length;
  }

  return { created };
}
