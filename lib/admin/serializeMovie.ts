/** JSON-ответы NextResponse не сериализуют bigint — Prisma отдаёт budget/revenue как BigInt. */
export function serializeMovieForAdminJson(movie: Record<string, unknown>): Record<string, unknown> {
  const { budget, revenue, ...rest } = movie;
  return {
    ...rest,
    budget: budget != null && typeof budget === "bigint" ? budget.toString() : (budget as string | null) ?? null,
    revenue: revenue != null && typeof revenue === "bigint" ? revenue.toString() : (revenue as string | null) ?? null,
  };
}
