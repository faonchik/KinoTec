"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/Button";

export default function ExportPage() {
  const { data: session, status } = useSession();
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importResult, setImportResult] = useState<string | null>(null);

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
      alert("Ошибка экспорта");
    } finally {
      setExporting(false);
    }
  };

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importFile) return;

    setImporting(true);
    setImportResult(null);

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
        setImportResult(`Импортировано: ${result.imported}, ошибок: ${result.errors}`);
        setImportFile(null);
      } else {
        setImportResult(`Ошибка: ${result.error}`);
      }
    } catch (error) {
      setImportResult("Ошибка чтения файла. Убедитесь, что это валидный JSON файл.");
    } finally {
      setImporting(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-slate-400">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold text-white mb-8">Экспорт и импорт данных</h1>

      <div className="space-y-8">
        {/* Export */}
        <section className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-white mb-4">Экспорт данных</h2>
          <p className="text-slate-400 mb-6">
            Экспортируйте свои списки просмотра, избранное и оценки в JSON или CSV формат
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h3 className="font-semibold text-white">Формат JSON</h3>
              <div className="space-y-2">
                <Button
                  onClick={() => handleExport("json", "all")}
                  disabled={exporting}
                  variant="outline"
                  className="w-full"
                >
                  Экспортировать всё (JSON)
                </Button>
                <Button
                  onClick={() => handleExport("json", "watchlist")}
                  disabled={exporting}
                  variant="outline"
                  className="w-full"
                >
                  Список просмотра (JSON)
                </Button>
                <Button
                  onClick={() => handleExport("json", "favorites")}
                  disabled={exporting}
                  variant="outline"
                  className="w-full"
                >
                  Избранное (JSON)
                </Button>
                <Button
                  onClick={() => handleExport("json", "watched")}
                  disabled={exporting}
                  variant="outline"
                  className="w-full"
                >
                  Просмотренные (JSON)
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-white">Формат CSV</h3>
              <div className="space-y-2">
                <Button
                  onClick={() => handleExport("csv", "all")}
                  disabled={exporting}
                  variant="outline"
                  className="w-full"
                >
                  Экспортировать всё (CSV)
                </Button>
                <Button
                  onClick={() => handleExport("csv", "watchlist")}
                  disabled={exporting}
                  variant="outline"
                  className="w-full"
                >
                  Список просмотра (CSV)
                </Button>
                <Button
                  onClick={() => handleExport("csv", "favorites")}
                  disabled={exporting}
                  variant="outline"
                  className="w-full"
                >
                  Избранное (CSV)
                </Button>
                <Button
                  onClick={() => handleExport("csv", "watched")}
                  disabled={exporting}
                  variant="outline"
                  className="w-full"
                >
                  Просмотренные (CSV)
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Import */}
        <section className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-white mb-4">Импорт данных</h2>
          <p className="text-slate-400 mb-6">
            Импортируйте данные из ранее экспортированного JSON файла
          </p>

          <form onSubmit={handleImport} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Выберите JSON файл
              </label>
              <input
                type="file"
                accept=".json"
                onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            {importResult && (
              <div className={`p-4 rounded-lg ${
                importResult.includes("Ошибка") 
                  ? "bg-red-500/20 text-red-400" 
                  : "bg-green-500/20 text-green-400"
              }`}>
                {importResult}
              </div>
            )}

            <Button type="submit" disabled={!importFile || importing}>
              {importing ? "Импорт..." : "Импортировать"}
            </Button>
          </form>
        </section>
      </div>
    </div>
  );
}

