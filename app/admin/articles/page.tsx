import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Badge } from "@/components/ui/Badge";
import { Pagination } from "@/components/ui/Pagination";

export const metadata: Metadata = {
  title: "Управление статьями",
};

interface AdminArticlesPageProps {
  searchParams: Promise<{ page?: string; q?: string }>;
}

const ARTICLES_PER_PAGE = 20;

async function getArticles(page: number, query?: string) {
  const skip = (page - 1) * ARTICLES_PER_PAGE;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {};

  if (query) {
    where.OR = [
      { title: { contains: query, mode: "insensitive" } },
      { content: { contains: query, mode: "insensitive" } },
    ];
  }

  const [articles, total] = await Promise.all([
    prisma.article.findMany({
      where,
      skip,
      take: ARTICLES_PER_PAGE,
      orderBy: { createdAt: "desc" },
    }),
    prisma.article.count({ where }),
  ]);

  return {
    articles,
    total,
    totalPages: Math.ceil(total / ARTICLES_PER_PAGE),
  };
}

export default async function AdminArticlesPage({ searchParams }: AdminArticlesPageProps) {
  const session = await getServerSession(authOptions);

  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "MODERATOR")) {
    redirect("/");
  }

  const params = await searchParams;
  const page = parseInt(params.page || "1");
  const query = params.q;

  const { articles, total, totalPages } = await getArticles(page, query);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Управление статьями</h1>
        <p className="text-slate-400 mt-1">Всего: {total}</p>
      </div>

      {/* Search */}
      <form className="mb-6">
        <div className="flex gap-4">
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder="Поиск по названию или содержимому..."
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

      {/* Articles Table */}
      <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-800">
            <tr>
              <th className="text-left p-4 text-slate-400 font-medium">Статья</th>
              <th className="text-left p-4 text-slate-400 font-medium">Категория</th>
              <th className="text-left p-4 text-slate-400 font-medium">Статус</th>
              <th className="text-left p-4 text-slate-400 font-medium">Дата</th>
              <th className="text-right p-4 text-slate-400 font-medium">Действия</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50">
            {articles.map((article) => (
              <tr key={article.id} className="hover:bg-slate-700/30">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    {article.cover ? (
                      <Image
                        src={article.cover}
                        alt={article.title}
                        width={60}
                        height={40}
                        className="rounded object-cover"
                      />
                    ) : (
                      <div className="w-15 h-10 bg-slate-700 rounded flex items-center justify-center">
                        <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                    )}
                    <div>
                      <Link href={`/blog/${article.slug}`} className="text-white hover:text-amber-400 font-medium">
                        {article.title}
                      </Link>
                      {article.excerpt && (
                        <p className="text-slate-500 text-sm line-clamp-1">{article.excerpt}</p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <Badge variant="primary">{article.category}</Badge>
                </td>
                <td className="p-4">
                  {article.published ? (
                    <Badge variant="primary" className="bg-green-500/20 text-green-400 border-green-500/50">
                      Опубликовано
                    </Badge>
                  ) : (
                    <Badge variant="primary" className="bg-slate-500/20 text-slate-400 border-slate-500/50">
                      Черновик
                    </Badge>
                  )}
                </td>
                <td className="p-4 text-slate-400">
                  {new Date(article.createdAt).toLocaleDateString("ru-RU")}
                </td>
                <td className="p-4 text-right">
                  <Link
                    href={`/blog/${article.slug}`}
                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors inline-block"
                    title="Просмотр"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-8">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            baseUrl={query ? `/admin/articles?q=${query}` : "/admin/articles"}
          />
        </div>
      )}
    </div>
  );
}

