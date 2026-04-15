import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getSecurityStats, getSecurityEvents } from "@/lib/security/logger";

// Получить статистику безопасности (только для админов)
export async function GET(_request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Только админы могут видеть статистику безопасности
  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const stats = getSecurityStats();
    const recentEvents = getSecurityEvents({
      limit: 100,
      since: new Date(Date.now() - 24 * 60 * 60 * 1000), // Последние 24 часа
    });

    return NextResponse.json({
      stats,
      recentEvents,
    });
  } catch (error) {
    console.error("Security stats error:", error);
    return NextResponse.json({ error: "Ошибка получения статистики" }, { status: 500 });
  }
}

