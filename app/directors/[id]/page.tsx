import { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { MovieCard } from "@/components/movies/MovieCard";
import { ExpandableText } from "@/components/ui/ExpandableText";
import { getTranslations } from "next-intl/server";

interface DirectorPageProps {
  params: Promise<{ id: string }>;
}

async function getDirector(id: string) {
  const director = await prisma.director.findUnique({
    where: { id },
    include: {
      movies: {
        include: {
          genres: { include: { genre: true } },
          ratings: true,
        },
        orderBy: { releaseDate: "desc" },
      },
      photos: { orderBy: { order: "asc" } },
    },
  });

  if (!director) notFound();

  return director;
}

export async function generateMetadata({ params }: DirectorPageProps): Promise<Metadata> {
  const { id } = await params;
  const director = await getDirector(id);

  return {
    title: director.name,
    description: director.bio || `Информация о режиссёре ${director.name}`,
    openGraph: {
      title: director.name,
      description: director.bio || "",
      images: director.photo ? [director.photo] : [],
    },
  };
}

export default async function DirectorPage({ params }: DirectorPageProps) {
  const { id } = await params;
  const director = await getDirector(id);
  const t = await getTranslations("directors");
  const tCommon = await getTranslations("common");

  const calculateAge = () => {
    if (!director.birthDate) return null;
    const endDate = director.deathDate || new Date();
    const age = Math.floor(
      (endDate.getTime() - director.birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000)
    );
    return age;
  };

  const age = calculateAge();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid md:grid-cols-[300px_1fr] gap-8 mb-12">
        {/* Photo & Info */}
        <div>
          {director.photo ? (
            <Image
              src={director.photo}
              alt={director.name}
              width={300}
              height={450}
              className="w-full aspect-[2/3] object-cover rounded-xl"
              priority
            />
          ) : (
            <div className="w-full aspect-[2/3] bg-slate-800 rounded-xl flex items-center justify-center">
              <svg className="w-24 h-24 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
          )}

          <div className="mt-6 space-y-4">
            {director.birthDate && (
              <div>
                <p className="text-slate-500 text-sm">{t("birthDate")}</p>
                <p className="text-white">
                  {new Date(director.birthDate).toLocaleDateString("ru-RU", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                  {age && !director.deathDate && ` (${age} ${tCommon("years")})`}
                </p>
              </div>
            )}

            {director.birthPlace && (
              <div>
                <p className="text-slate-500 text-sm">{t("birthPlace")}</p>
                <p className="text-white">{director.birthPlace}</p>
              </div>
            )}

            {director.deathDate && (
              <div>
                <p className="text-slate-500 text-sm">{t("deathDate")}</p>
                <p className="text-white">
                  {new Date(director.deathDate).toLocaleDateString("ru-RU", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                  {age && ` (${age} ${tCommon("years")})`}
                </p>
              </div>
            )}

            <div>
              <p className="text-slate-500 text-sm">{t("movies")}</p>
              <p className="text-white">{director.movies.length}</p>
            </div>
          </div>
        </div>

        {/* Bio */}
        <div>
          <h1 className="text-4xl font-bold text-white mb-6">{director.name}</h1>
          
          {director.bio && (
            <div className="prose prose-invert max-w-none">
              <h2 className="text-xl font-semibold text-white mb-4">{t("biography")}</h2>
              <ExpandableText
                text={director.bio}
                maxLength={500}
                className="text-slate-300 whitespace-pre-line leading-relaxed"
              />
            </div>
          )}
        </div>
      </div>

      {/* Photo Gallery */}
      {director.photos.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">{t("photoGallery")}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {director.photos.map((photo) => (
              <div key={photo.id} className="aspect-square relative rounded-lg overflow-hidden">
                <Image
                  src={photo.url}
                  alt={photo.caption || director.name}
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Filmography */}
      {director.movies.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold text-white mb-6">{t("filmography")}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {director.movies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

