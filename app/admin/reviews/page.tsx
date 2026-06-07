import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { ReviewActions } from "./ReviewActions";

export const metadata: Metadata = {
  title: "Модерация отзывов",
};

interface AdminReviewsPageProps {
  searchParams: Promise<{ status?: string }>;
}

async function getReviews(showPending: boolean) {
  return await prisma.review.findMany({
    where: showPending ? { isApproved: false } : undefined,
    include: {
      user: { select: { name: true, email: true } },
      movie: {
        select: {
          id: true,
          title: true,
          ratings: {
            select: { userId: true, value: true },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export default async function AdminReviewsPage({ searchParams }: AdminReviewsPageProps) {
  const session = await getServerSession(authOptions);

  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "MODERATOR")) {
    redirect("/");
  }

  const params = await searchParams;
  const showPending = params.status === "pending";
  const reviews = await getReviews(showPending);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Модерация отзывов</h1>
        <p className="text-slate-400 mt-1">Всего: {reviews.length}</p>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        <Link
          href="/admin/reviews"
          className={`px-4 py-2 rounded-lg transition-colors ${
            !showPending
              ? "bg-amber-500 text-white"
              : "bg-slate-800 text-slate-300 hover:bg-slate-700"
          }`}
        >
          Все
        </Link>
        <Link
          href="/admin/reviews?status=pending"
          className={`px-4 py-2 rounded-lg transition-colors ${
            showPending
              ? "bg-amber-500 text-white"
              : "bg-slate-800 text-slate-300 hover:bg-slate-700"
          }`}
        >
          На модерации
        </Link>
      </div>

      {reviews.length === 0 ? (
        <div className="text-center py-16">
          <svg className="w-16 h-16 mx-auto text-slate-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <p className="text-slate-400 text-lg">
            {showPending ? "Нет отзывов на модерации" : "Нет отзывов"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => {
            const ratingValue = review.movie.ratings.find(
              (r) => r.userId === review.userId
            )?.value;
            return (
              <div
                key={review.id}
                className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <Link
                      href={`/movies/${review.movie.id}`}
                      className="text-lg font-semibold text-white hover:text-amber-400 transition-colors"
                    >
                      {review.movie.title}
                    </Link>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-slate-400 text-sm">
                        от {review.user.name || review.user.email} •{" "}
                        {new Date(review.createdAt).toLocaleDateString("ru-RU")}
                      </p>
                      {ratingValue && (
                        <span className="text-xs text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 flex items-center gap-1 font-mono">
                          ★ {ratingValue} / 10
                        </span>
                      )}
                    </div>
                  </div>
                <div className="flex items-center gap-2">
                  {review.isApproved ? (
                    <span className="px-3 py-1 bg-green-500/20 text-green-400 text-sm rounded-full">
                      Одобрен
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 text-sm rounded-full">
                      На модерации
                    </span>
                  )}
                </div>
              </div>
              
              <p className="text-slate-300 mb-4">{review.content}</p>
              
              <ReviewActions reviewId={review.id} isApproved={review.isApproved} />
            </div>
          );
        })}
      </div>
      )}
    </div>
  );
}

