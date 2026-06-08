"use client";

import ErrorComponent from "@/app/error";

export default function Error500PreviewPage() {
  const mockError = {
    name: "PrismaClientInitializationError",
    message: "Invalid `prisma.user.findMany()` invocation. Can't reach database server at `railwaypostgresql:5432` - Connection timed out.",
    stack: "PrismaClientInitializationError: Invalid `prisma.user.findMany()` invocation\n  at prisma.user.findMany() in /app/api/admin/route.ts:54:21\n  at runNextServerMigration() in /app/node_modules/next/server.js:12:43\n  at process.processTicksAndRejections (node:internal/process/task_queues:95:5)",
    digest: "1780866875798"
  };

  const mockReset = () => {
    alert("Вызов функции сброса ошибки (reset()). Перезапуск компонента...");
  };

  return <ErrorComponent error={mockError} reset={mockReset} />;
}
