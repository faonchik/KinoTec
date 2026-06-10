import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createNotification } from "@/lib/notifications/createNotification";

/**
 * POST /api/notifications/test
 * Creates a test notification for the current authenticated user.
 * Useful for verifying that the notification system works end-to-end.
 */
export async function POST() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const notification = await createNotification({
      userId: session.user.id,
      type: "SYSTEM",
      title: "Тестовое уведомление",
      message: "Система уведомлений работает корректно! 🎉",
      link: "/profile",
    });

    return NextResponse.json({
      success: true,
      notification: {
        id: notification.id,
        title: notification.title,
        message: notification.message,
      },
    });
  } catch (error) {
    console.error("Test notification error:", error);
    return NextResponse.json({ error: "Failed to create test notification" }, { status: 500 });
  }
}
