import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { Badge } from "@/components/ui/Badge";
import { ArticleComments } from "@/components/comments/ArticleComments";

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

const categoryNames = {
  NEWS: "Новости",
  INTERVIEW: "Интервью",
  REVIEW: "Обзоры",
  FEATURE: "Статьи",
};

async function getArticle(slug: string) {
  const article = await prisma.article.findUnique({
    where: { slug, published: true },
  });

  if (!article) notFound();

  return article;
}

async function getRelatedArticles(articleId: string, category: string) {
  return await prisma.article.findMany({
    where: {
      id: { not: articleId },
      category: category as keyof typeof categoryNames,
      published: true,
    },
    take: 3,
    orderBy: { publishedAt: "desc" },
  });
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);

  return {
    title: article.title,
    description: article.excerpt || article.title,
    openGraph: {
      title: article.title,
      description: article.excerpt || "",
      images: article.cover ? [article.cover] : [],
      type: "article",
    },
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = await getArticle(slug);
  const relatedArticles = await getRelatedArticles(article.id, article.category);

  // Загружаем комментарии
  const comments = await prisma.articleComment.findMany({
    where: {
      articleId: article.id,
      parentId: null,
    },
    include: {
      user: { select: { id: true, name: true, avatar: true } },
      replies: {
        include: {
          user: { select: { id: true, name: true, avatar: true } },
        },
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <article className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Badge variant="primary">
              {categoryNames[article.category]}
            </Badge>
            {article.publishedAt && (
              <span className="text-slate-500">
                {new Date(article.publishedAt).toLocaleDateString("ru-RU", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            )}
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {article.title}
          </h1>
          
          {article.excerpt && (
            <p className="text-xl text-slate-400">{article.excerpt}</p>
          )}
        </header>

        {/* Cover Image */}
        {article.cover && (
          <div className="aspect-video relative rounded-xl overflow-hidden mb-8">
            <Image
              src={article.cover}
              alt={article.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
            />
          </div>
        )}

        {/* Content */}
        <div className="prose prose-invert prose-lg max-w-none">
          <div 
            className="text-slate-300 leading-relaxed whitespace-pre-line"
            dangerouslySetInnerHTML={{ 
              __html: article.content
                .replace(/^# (.+)$/gm, '<h1 class="text-3xl font-bold text-white mt-8 mb-4">$1</h1>')
                .replace(/^## (.+)$/gm, '<h2 class="text-2xl font-bold text-white mt-6 mb-3">$1</h2>')
                .replace(/^### (.+)$/gm, '<h3 class="text-xl font-bold text-white mt-4 mb-2">$1</h3>')
                .replace(/\n\n/g, '</p><p class="mb-4">')
            }}
          />
        </div>

        {/* Комментарии */}
        <ArticleComments articleId={article.id} initialComments={comments} />

        {/* Share */}
        <div className="flex items-center gap-4 mt-12 pt-8 border-t border-slate-700">
          <span className="text-slate-400">Поделиться:</span>
          <div className="flex gap-2">
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title)}&url=${encodeURIComponent(`https://kinoteka.com/blog/${article.slug}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
              </svg>
            </a>
            <a
              href={`https://t.me/share/url?url=${encodeURIComponent(`https://kinoteka.com/blog/${article.slug}`)}&text=${encodeURIComponent(article.title)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
              </svg>
            </a>
          </div>
        </div>
      </article>

      {/* Related Articles */}
      {relatedArticles.length > 0 && (
        <section className="mt-16">
          <h2 className="text-2xl font-bold text-white mb-6">Похожие статьи</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedArticles.map((related) => (
              <Link key={related.id} href={`/blog/${related.slug}`}>
                <article className="group bg-slate-800/50 rounded-xl overflow-hidden border border-slate-700/50 hover:border-amber-500/50 transition-all">
                  {related.cover && (
                    <div className="aspect-video relative overflow-hidden">
                      <Image
                        src={related.cover}
                        alt={related.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 400px"
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="font-semibold text-white group-hover:text-amber-400 transition-colors line-clamp-2">
                      {related.title}
                    </h3>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

