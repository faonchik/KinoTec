"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface Movie {
  id: string;
  title: string;
  originalTitle?: string | null;
  releaseDate?: Date | string | null;
  description?: string | null;
  country?: string | null;
  runtime?: number | null;
  genres?: { genre: { name: string } }[];
  director?: { name: string } | null;
  ratings?: { value: number }[];
}

interface ExportPDFProps {
  movies: Movie[];
  title?: string;
}

export function ExportPDF({ movies, title = "Список фильмов" }: ExportPDFProps) {
  const [isExporting, setIsExporting] = useState(false);

  const calculateAvgRating = (ratings?: { value: number }[]) => {
    if (!ratings?.length) return "-";
    const avg = ratings.reduce((acc, r) => acc + r.value, 0) / ratings.length;
    return avg.toFixed(1);
  };

  const formatDate = (date?: Date | string | null) => {
    if (!date) return "-";
    return new Date(date).getFullYear().toString();
  };

  const handleExport = async () => {
    setIsExporting(true);

    try {
      // Создаём PDF документ
      const doc = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      // Добавляем заголовок
      doc.setFontSize(20);
      doc.setTextColor(40, 40, 40);
      doc.text(title, 14, 20);

      // Добавляем дату экспорта
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(
        `Экспортировано: ${new Date().toLocaleDateString("ru-RU", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}`,
        14,
        28
      );

      // Подготавливаем данные для таблицы
      const tableData = movies.map((movie, index) => [
        (index + 1).toString(),
        movie.title,
        movie.originalTitle || "-",
        formatDate(movie.releaseDate),
        movie.genres?.map((g) => g.genre.name).join(", ") || "-",
        movie.director?.name || "-",
        movie.country || "-",
        movie.runtime ? `${movie.runtime} мин` : "-",
        calculateAvgRating(movie.ratings),
      ]);

      // Создаём таблицу
      autoTable(doc, {
        startY: 35,
        head: [
          [
            "№",
            "Название",
            "Оригинал",
            "Год",
            "Жанры",
            "Режиссёр",
            "Страна",
            "Время",
            "Рейтинг",
          ],
        ],
        body: tableData,
        styles: {
          fontSize: 8,
          cellPadding: 2,
        },
        headStyles: {
          fillColor: [245, 158, 11], // amber-500
          textColor: [0, 0, 0],
          fontStyle: "bold",
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252], // slate-50
        },
        columnStyles: {
          0: { cellWidth: 10 },
          1: { cellWidth: 40 },
          2: { cellWidth: 35 },
          3: { cellWidth: 15 },
          4: { cellWidth: 35 },
          5: { cellWidth: 30 },
          6: { cellWidth: 25 },
          7: { cellWidth: 15 },
          8: { cellWidth: 15 },
        },
      });

      // Добавляем футер с информацией
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(
          `КиноТека - Страница ${i} из ${pageCount}`,
          doc.internal.pageSize.getWidth() / 2,
          doc.internal.pageSize.getHeight() - 10,
          { align: "center" }
        );
      }

      // Сохраняем файл
      const fileName = `kinoteka-${title.toLowerCase().replace(/\s+/g, "-")}-${
        new Date().toISOString().split("T")[0]
      }.pdf`;
      doc.save(fileName);
    } catch (error) {
      console.error("Ошибка экспорта PDF:", error);
      alert("Ошибка при создании PDF файла");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      onClick={handleExport}
      variant="secondary"
      disabled={isExporting || movies.length === 0}
      className="gap-2"
    >
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
      {isExporting ? "Экспорт..." : "Скачать PDF"}
    </Button>
  );
}

