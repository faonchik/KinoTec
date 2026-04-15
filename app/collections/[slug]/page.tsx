import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import prisma from "@/lib/prisma";
import { MovieGrid } from "@/components/movies/MovieGrid";

interface CollectionPageProps {
  params: Promise<{ slug: string }>;
}

async function getCollection(slug: string) {
  const collection = await prisma.collection.findUnique({
    where: { slug },
    include: {
      movies: {
        include: {
          movie: {
            include: {
              genres: { include: { genre: true } },
              ratings: true,
            },
          },
        },
        orderBy: { order: "asc" },
      },
    },
  });

  if (!collection) notFound();
  return collection;
}

export async function generateMetadata({ params }: CollectionPageProps): Promise<Metadata> {
  const { slug } = await params;
  const collection = await getCollection(slug);
  const t = await getTranslations("collections");

  return {
    title: collection.title,
    description: collection.description || `${t("collectionPrefix")} ${collection.title}`,
  };
}

export default async function CollectionPage({ params }: CollectionPageProps) {
  const { slug } = await params;
  const collection = await getCollection(slug);
  const t = await getTranslations("collections");

  const movies = collection.movies.map((cm) => cm.movie);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Заголовок */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">{collection.title}</h1>
        {collection.description && (
          <p className="text-slate-400 text-lg max-w-2xl">{collection.description}</p>
        )}
        <p className="text-amber-400 mt-2">
          {t("moviesInCollection", { count: movies.length })}
        </p>
      </div>

      {/* Фильмы */}
      <MovieGrid movies={movies} />
    </div>
  );
}

