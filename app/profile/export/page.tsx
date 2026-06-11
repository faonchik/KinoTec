"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useTranslations } from "next-intl";

export default function ExportPage() {
  const { status } = useSession();
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importStatus, setImportStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const t = useTranslations("exportImport");
  const tc = useTranslations("common");

  if (status === "unauthenticated") {
    redirect("/auth/signin");
  }

  const handleExport = async (format: "json" | "csv", type: string) => {
    setExporting(true);
    try {
      const res = await fetch(`/api/user/export?format=${format}&type=${type}`);
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `kinoteka-export-${type}-${new Date().toISOString().split("T")[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export error:", error);
      alert(t("exportError"));
    } finally {
      setExporting(false);
    }
  };

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importFile) return;

    setImporting(true);
    setImportStatus(null);

    try {
      const text = await importFile.text();
      const data = JSON.parse(text);

      // Определяем тип данных
      let type = "watchlist";
      if (data.favorites) type = "favorites";
      else if (data.ratings) type = "ratings";
      else if (data.watched) type = "watched";

      const items = data[type] || data.watchlist || data.favorites || data.ratings || data.watched || [];

      const res = await fetch("/api/user/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: items, type }),
      });

      const result = await res.json();
      if (res.ok) {
        setImportStatus({
          type: "success",
          message: t("importSuccess", { imported: result.imported, errors: result.errors }),
        });
        setImportFile(null);
      } else {
        setImportStatus({
          type: "error",
          message: t("importError", { error: result.error }),
        });
      }
    } catch {
      setImportStatus({
        type: "error",
        message: t("invalidJson"),
      });
    } finally {
      setImporting(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-slate-400">{tc("loading")}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold text-white mb-8">{t("title")}</h1>

      <div className="space-y-8">
        {/* Export */}
        <section className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-white mb-4">{t("exportSection")}</h2>
          <p className="text-slate-400 mb-6">
            {t("exportDesc")}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h3 className="font-semibold text-white">{t("jsonFormat")}</h3>
              <div className="space-y-2">
                <Button
                  onClick={() => handleExport("json", "all")}
                  disabled={exporting}
                  variant="outline"
                  className="w-full"
                >
                  {t("exportAll", { format: "JSON" })}
                </Button>
                <Button
                  onClick={() => handleExport("json", "watchlist")}
                  disabled={exporting}
                  variant="outline"
                  className="w-full"
                >
                  {t("watchlist", { format: "JSON" })}
                </Button>
                <Button
                  onClick={() => handleExport("json", "favorites")}
                  disabled={exporting}
                  variant="outline"
                  className="w-full"
                >
                  {t("favorites", { format: "JSON" })}
                </Button>
                <Button
                  onClick={() => handleExport("json", "watched")}
                  disabled={exporting}
                  variant="outline"
                  className="w-full"
                >
                  {t("watched", { format: "JSON" })}
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-white">{t("csvFormat")}</h3>
              <div className="space-y-2">
                <Button
                  onClick={() => handleExport("csv", "all")}
                  disabled={exporting}
                  variant="outline"
                  className="w-full"
                >
                  {t("exportAll", { format: "CSV" })}
                </Button>
                <Button
                  onClick={() => handleExport("csv", "watchlist")}
                  disabled={exporting}
                  variant="outline"
                  className="w-full"
                >
                  {t("watchlist", { format: "CSV" })}
                </Button>
                <Button
                  onClick={() => handleExport("csv", "favorites")}
                  disabled={exporting}
                  variant="outline"
                  className="w-full"
                >
                  {t("favorites", { format: "CSV" })}
                </Button>
                <Button
                  onClick={() => handleExport("csv", "watched")}
                  disabled={exporting}
                  variant="outline"
                  className="w-full"
                >
                  {t("watched", { format: "CSV" })}
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Import */}
        <section className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-white mb-4">{t("importSection")}</h2>
          <p className="text-slate-400 mb-6">
            {t("importDesc")}
          </p>

          <form onSubmit={handleImport} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                {t("selectFile")}
              </label>
              <input
                type="file"
                accept=".json"
                onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            {importStatus && (
              <div className={`p-4 rounded-lg ${
                importStatus.type === "error" 
                  ? "bg-red-500/20 text-red-400" 
                  : "bg-green-500/20 text-green-400"
              }`}>
                {importStatus.message}
              </div>
            )}

            <Button type="submit" disabled={!importFile || importing}>
              {importing ? t("importing") : t("importBtn")}
            </Button>
          </form>
        </section>
      </div>
    </div>
  );
}

