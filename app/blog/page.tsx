import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import prisma from "@/lib/prisma";
import { Badge } from "@/components/ui/Badge";
import { Pagination } from "@/components/ui/Pagination";

export const metadata: Metadata = {
  title: "Блог",
  description: "Новости и статьи о кино",
};

interface BlogPageProps {
  searchParams: Promise<{ page?: string; category?: string }>;
}

const ARTICLES_PER_PAGE = 12;

const categoryNames = {
  NEWS: "Новости",
  INTERVIEW: "Интервью",
  REVIEW: "Обзоры",
  FEATURE: "Статьи",
};

async function getArticles(page: number, category?: string) {
  const skip = (page - 1) * ARTICLES_PER_PAGE;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = { published: true };
  
  if (category && category in categoryNames) {
    where.category = category;
  }

  const [articles, total] = await Promise.all([
    prisma.article.findMany({
      where,
      skip,
      take: ARTICLES_PER_PAGE,
      orderBy: { publishedAt: "desc" },
    }),
    prisma.article.count({ where }),
  ]);

  return {
    articles,
    total,
    totalPages: Math.ceil(total / ARTICLES_PER_PAGE),
  };
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const params = await searchParams;
  const page = parseInt(params.page || "1");
  const category = params.category;
  
  const { articles, total, totalPages } = await getArticles(page, category);

  const baseUrl = category ? `/blog?category=${category}` : "/blog";

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Блог</h1>
        <p className="text-slate-400">Новости и статьи о киноиндустрии</p>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 mb-8">
        <Link
          href="/blog"
          className={`px-4 py-2 rounded-lg transition-colors ${
            !category
              ? "bg-amber-500 text-white"
              : "bg-slate-800 text-slate-300 hover:bg-slate-700"
          }`}
        >
          Все
        </Link>
        {Object.entries(categoryNames).map(([key, name]) => (
          <Link
            key={key}
            href={`/blog?category=${key}`}
            className={`px-4 py-2 rounded-lg transition-colors ${
              category === key
                ? "bg-amber-500 text-white"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            {name}
          </Link>
        ))}
      </div>

      {articles.length === 0 ? (
        <div className="text-center py-16">
          <svg className="w-16 h-16 mx-auto text-slate-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
          </svg>
          <p className="text-slate-400 text-lg">Статьи не найдены</p>
        </div>
      ) : (
        <>
          <p className="text-slate-400 mb-6">Найдено статей: {total}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <Link key={article.id} href={`/blog/${article.slug}`}>
                <article className="group bg-slate-800/50 rounded-xl overflow-hidden border border-slate-700/50 hover:border-amber-500/50 transition-all h-full">
                  {article.cover && (
                    <div className="aspect-video relative overflow-hidden">
                      <Image
                        src={article.cover}
                        alt={article.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 400px"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <Badge variant="primary">
                        {categoryNames[article.category]}
                      </Badge>
                      {article.publishedAt && (
                        <span className="text-slate-500 text-sm">
                          {new Date(article.publishedAt).toLocaleDateString("ru-RU", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      )}
                    </div>
                    <h2 className="text-xl font-semibold text-white group-hover:text-amber-400 transition-colors mb-2 line-clamp-2">
                      {article.title}
                    </h2>
                    {article.excerpt && (
                      <p className="text-slate-400 line-clamp-3">{article.excerpt}</p>
                    )}
                  </div>
                </article>
              </Link>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-12">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                baseUrl={baseUrl}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}

