import { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { MovieCard } from "@/components/movies/MovieCard";
import { ExpandableText } from "@/components/ui/ExpandableText";
import { getTranslations } from "next-intl/server";

interface ActorPageProps {
  params: Promise<{ id: string }>;
}

async function getActor(id: string) {
  const actor = await prisma.actor.findUnique({
    where: { id },
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
        orderBy: {
          movie: { releaseDate: "desc" },
        },
      },
      photos: { orderBy: { order: "asc" } },
    },
  });

  if (!actor) notFound();

  return actor;
}

export async function generateMetadata({ params }: ActorPageProps): Promise<Metadata> {
  const { id } = await params;
  const actor = await getActor(id);

  return {
    title: actor.name,
    description: actor.bio || `Информация об актёре ${actor.name}`,
    openGraph: {
      title: actor.name,
      description: actor.bio || "",
      images: actor.photo ? [actor.photo] : [],
    },
  };
}

export default async function ActorPage({ params }: ActorPageProps) {
  const { id } = await params;
  const actor = await getActor(id);
  const t = await getTranslations("actors");
  const tCommon = await getTranslations("common");

  const calculateAge = () => {
    if (!actor.birthDate) return null;
    const endDate = actor.deathDate || new Date();
    const age = Math.floor(
      (endDate.getTime() - actor.birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000)
    );
    return age;
  };

  const age = calculateAge();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid md:grid-cols-[300px_1fr] gap-8 mb-12">
        {/* Photo & Info */}
        <div>
          {actor.photo ? (
            <Image
              src={actor.photo}
              alt={actor.name}
              width={300}
              height={450}
              className="w-full aspect-[2/3] object-cover rounded-xl"
              priority
            />
          ) : (
            <div className="w-full aspect-[2/3] bg-slate-800 rounded-xl flex items-center justify-center">
              <svg className="w-24 h-24 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          )}

          <div className="mt-6 space-y-4">
            {actor.birthDate && (
              <div>
                <p className="text-slate-500 text-sm">{t("birthDate")}</p>
                <p className="text-white">
                  {new Date(actor.birthDate).toLocaleDateString("ru-RU", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                  {age && !actor.deathDate && ` (${age} ${tCommon("years")})`}
                </p>
              </div>
            )}

            {actor.birthPlace && (
              <div>
                <p className="text-slate-500 text-sm">{t("birthPlace")}</p>
                <p className="text-white">{actor.birthPlace}</p>
              </div>
            )}

            {actor.deathDate && (
              <div>
                <p className="text-slate-500 text-sm">{t("deathDate")}</p>
                <p className="text-white">
                  {new Date(actor.deathDate).toLocaleDateString("ru-RU", {
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
              <p className="text-white">{actor.movies.length}</p>
            </div>
          </div>
        </div>

        {/* Bio */}
        <div>
          <h1 className="text-4xl font-bold text-white mb-6">{actor.name}</h1>
          
          {actor.bio && (
            <div className="prose prose-invert max-w-none">
              <h2 className="text-xl font-semibold text-white mb-4">{t("biography")}</h2>
              <ExpandableText
                text={actor.bio}
                maxLength={500}
                className="text-slate-300 whitespace-pre-line leading-relaxed"
              />
            </div>
          )}
        </div>
      </div>

      {/* Photo Gallery */}
      {actor.photos.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">{t("photoGallery")}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {actor.photos.map((photo) => (
              <div key={photo.id} className="aspect-square relative rounded-lg overflow-hidden">
                <Image
                  src={photo.url}
                  alt={photo.caption || actor.name}
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Filmography */}
      {actor.movies.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold text-white mb-6">{t("filmography")}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {actor.movies.map((ma) => (
              <div key={ma.movieId}>
                <MovieCard movie={ma.movie} />
                {ma.character && (
                  <p className="text-sm text-slate-400 mt-2 text-center">
                    {ma.character}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

