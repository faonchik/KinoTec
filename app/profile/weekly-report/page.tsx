"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { useTranslations, useLocale } from "next-intl";

interface WeeklyReport {
  period: { from: string; to: string };
  watchedMovies: number;
  watchedSeries: number;
  totalMinutes: number;
  hours: number;
  ratings: number;
  reviews: number;
  avgRating: string;
  topGenres: string[];
  movies: Array<{
    id: string;
    title: string;
    poster: string | null;
    watchedAt: string;
  }>;
  series: Array<{
    id: string;
    title: string;
    poster: string | null;
    watchedAt: string;
  }>;
}

export default function WeeklyReportPage() {
  const { data: session, status } = useSession();
  const [report, setReport] = useState<WeeklyReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const t = useTranslations("weeklyReport");
  const tc = useTranslations("common");
  const locale = useLocale();

  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/auth/signin");
    }
    if (session) {
      fetchReport();
    }
  }, [session, status]);

  const fetchReport = async () => {
    try {
      const res = await fetch("/api/user/weekly-report");
      const data = await res.json();
      setReport(data);
    } catch (error) {
      console.error("Error fetching report:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendEmail = async () => {
    if (!session?.user?.email) return;

    setSending(true);
    try {
      const res = await fetch("/api/user/weekly-report", {
        method: "POST",
      });

      if (res.ok) {
        alert(t("sentSuccess"));
      } else {
        alert(t("sentError"));
      }
    } catch (error) {
      console.error("Error sending report:", error);
      alert(t("sentError"));
    } finally {
      setSending(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-slate-400">{tc("loading")}</div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-16">
          <div className="text-6xl mb-4">📊</div>
          <h2 className="text-2xl font-bold text-white mb-2">{t("noData")}</h2>
          <p className="text-slate-400 mb-6">{t("noDataDesc")}</p>
          <Link href="/movies">
            <Button>{t("goToCatalog")}</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">{t("title")}</h1>
          <p className="text-slate-400">
            {new Date(report.period.from).toLocaleDateString(locale)} —{" "}
            {new Date(report.period.to).toLocaleDateString(locale)}
          </p>
        </div>
        <Button onClick={handleSendEmail} disabled={sending}>
          {sending ? t("sending") : t("sendEmail")}
        </Button>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
          <div className="text-3xl font-bold text-white mb-1">{report.watchedMovies}</div>
          <div className="text-slate-400 text-sm">{t("movies")}</div>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
          <div className="text-3xl font-bold text-white mb-1">{report.watchedSeries}</div>
          <div className="text-slate-400 text-sm">{t("series")}</div>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
          <div className="text-3xl font-bold text-white mb-1">{report.hours}</div>
          <div className="text-slate-400 text-sm">{t("hours")}</div>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
          <div className="text-3xl font-bold text-white mb-1">{report.avgRating}</div>
          <div className="text-slate-400 text-sm">{t("avgRating")}</div>
        </div>
      </div>

      {/* Дополнительная статистика */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">{t("activity")}</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-slate-400">{t("ratingsLeft")}</span>
              <span className="text-white font-semibold">{report.ratings}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">{t("reviewsWritten")}</span>
              <span className="text-white font-semibold">{report.reviews}</span>
            </div>
          </div>
        </div>

        {report.topGenres.length > 0 && (
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">{t("favoriteGenres")}</h3>
            <div className="flex flex-wrap gap-2">
              {report.topGenres.map((genre, index) => (
                <span
                  key={genre}
                  className="px-3 py-1 bg-amber-500/20 text-amber-400 rounded-full text-sm"
                >
                  {index + 1}. {genre}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Просмотренные фильмы */}
      {report.movies.length > 0 && (
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">{t("watchedMovies")}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {report.movies.map((movie) => (
              <Link
                key={movie.id}
                href={`/movies/${movie.id}`}
                className="group"
              >
                <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-slate-800 mb-2">
                  {movie.poster ? (
                    <Image
                      src={movie.poster}
                      alt={movie.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl">
                      🎬
                    </div>
                  )}
                </div>
                <h3 className="text-sm text-white group-hover:text-amber-400 transition-colors line-clamp-2">
                  {movie.title}
                </h3>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Просмотренные сериалы */}
      {report.series.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold text-white mb-4">{t("watchedSeries")}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {report.series.map((series) => (
              <Link
                key={series.id}
                href={`/series/${series.id}`}
                className="group"
              >
                <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-slate-800 mb-2">
                  {series.poster ? (
                    <Image
                      src={series.poster}
                      alt={series.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl">
                      📺
                    </div>
                  )}
                </div>
                <h3 className="text-sm text-white group-hover:text-amber-400 transition-colors line-clamp-2">
                  {series.title}
                </h3>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

