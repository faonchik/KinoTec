import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

/**
 * Webhook endpoint для автоматического деплоя
 * Вызывается из GitHub Actions вместо прямого SSH
 */
export async function POST(request: NextRequest) {
  try {
    // Проверяем секрет (из заголовка или body)
    const authHeader = request.headers.get("authorization");
    const expectedSecret = process.env.DEPLOY_WEBHOOK_SECRET;

    if (!expectedSecret) {
      return NextResponse.json(
        { error: "Webhook secret not configured" },
        { status: 500 }
      );
    }

    // Проверяем авторизацию
    if (authHeader !== `Bearer ${expectedSecret}`) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Получаем данные из запроса (для будущего использования)
    await request.json().catch(() => ({}));

    // Запускаем деплой в фоне
    const deployScript = `
      cd /var/www/u3350084/data/www/kinoteck.ru || cd /www/kinoteck.ru/www || cd ~/www
      git fetch origin
      git reset --hard origin/main || git reset --hard origin/master
      docker-compose down || true
      docker-compose build --no-cache
      docker-compose up -d
      sleep 15
      docker-compose exec -T app npx prisma generate || true
      docker-compose exec -T app npx prisma migrate deploy || true
    `;

    // Запускаем деплой асинхронно (не ждем завершения)
    execAsync(deployScript).catch((error) => {
      console.error("Deploy error:", error);
    });

    return NextResponse.json({
      success: true,
      message: "Deployment started",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// GET для проверки работоспособности
export async function GET() {
  return NextResponse.json({
    status: "ok",
    message: "Deploy webhook is ready",
  });
}



