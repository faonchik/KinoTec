import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Pagination } from "@/components/ui/Pagination";
import { UsersClient } from "./UsersClient";

export const metadata: Metadata = {
  title: "Управление пользователями",
};

interface AdminUsersPageProps {
  searchParams: Promise<{ page?: string; q?: string }>;
}

const USERS_PER_PAGE = 20;

async function getUsers(page: number, query?: string) {
  const skip = (page - 1) * USERS_PER_PAGE;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {};

  if (query) {
    where.OR = [
      { name: { contains: query, mode: "insensitive" } },
      { email: { contains: query, mode: "insensitive" } },
    ];
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: USERS_PER_PAGE,
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            reviews: true,
            ratings: true,
            favorites: true,
            watchlists: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.count({ where }),
  ]);

  return {
    users,
    total,
    totalPages: Math.ceil(total / USERS_PER_PAGE),
  };
}

export default async function AdminUsersPage({ searchParams }: AdminUsersPageProps) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    redirect("/");
  }

  const params = await searchParams;
  const page = parseInt(params.page || "1");
  const query = params.q;

  const { users, total, totalPages } = await getUsers(page, query);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Управление пользователями</h1>
        <p className="text-slate-400 mt-1">Всего: {total}</p>
      </div>

      {/* Search */}
      <form className="mb-6">
        <div className="flex gap-4">
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder="Поиск по имени или email..."
            className="flex-1 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
          <button
            type="submit"
            className="px-6 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors"
          >
            Найти
          </button>
        </div>
      </form>

      {/* Users Table */}
      <UsersClient users={users} />

      {totalPages > 1 && (
        <div className="mt-8">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            baseUrl={query ? `/admin/users?q=${query}` : "/admin/users"}
          />
        </div>
      )}
    </div>
  );
}

