"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface ExportMoviesButtonProps {
  queryParams?: Record<string, string>;
}

export function ExportMoviesButton({ queryParams = {} }: ExportMoviesButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);

    try {
      // Получаем все фильмы по текущим фильтрам
      const searchParams = new URLSearchParams(queryParams);
      const res = await fetch(`/api/movies/export?${searchParams.toString()}`);
      
      if (!res.ok) {
        throw new Error("Ошибка загрузки данных");
      }
      
      const movies = await res.json();

      // Создаём PDF документ
      const doc = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      // Заголовок
      doc.setFontSize(24);
      doc.setTextColor(245, 158, 11); // amber-500
      doc.text("КиноТека", 14, 20);

      doc.setFontSize(14);
      doc.setTextColor(40, 40, 40);
      doc.text("Каталог фильмов", 14, 30);

      // Дата экспорта
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(
        `Дата экспорта: ${new Date().toLocaleDateString("ru-RU", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}`,
        14,
        38
      );
      doc.text(`Всего фильмов: ${movies.length}`, 14, 44);

      // Подготавливаем данные для таблицы
      const tableData = movies.map((movie: {
        title: string;
        originalTitle?: string;
        releaseDate?: string;
        genres?: { genre: { name: string } }[];
        director?: { name: string };
        country?: string;
        runtime?: number;
        ratings?: { value: number }[];
      }, index: number) => {
        const avgRating = movie.ratings?.length
          ? (movie.ratings.reduce((acc: number, r: { value: number }) => acc + r.value, 0) / movie.ratings.length).toFixed(1)
          : "-";
        
        return [
          (index + 1).toString(),
          movie.title || "-",
          movie.originalTitle || "-",
          movie.releaseDate ? new Date(movie.releaseDate).getFullYear().toString() : "-",
          movie.genres?.map((g: { genre: { name: string } }) => g.genre.name).join(", ") || "-",
          movie.director?.name || "-",
          movie.country || "-",
          movie.runtime ? `${movie.runtime} мин` : "-",
          avgRating,
        ];
      });

      // Создаём таблицу
      autoTable(doc, {
        startY: 50,
        head: [
          ["№", "Название", "Оригинал", "Год", "Жанры", "Режиссёр", "Страна", "Время", "⭐"],
        ],
        body: tableData,
        styles: {
          fontSize: 8,
          cellPadding: 2,
          overflow: "linebreak",
        },
        headStyles: {
          fillColor: [245, 158, 11],
          textColor: [0, 0, 0],
          fontStyle: "bold",
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252],
        },
        columnStyles: {
          0: { cellWidth: 8 },
          1: { cellWidth: 38 },
          2: { cellWidth: 32 },
          3: { cellWidth: 12 },
          4: { cellWidth: 40 },
          5: { cellWidth: 28 },
          6: { cellWidth: 22 },
          7: { cellWidth: 14 },
          8: { cellWidth: 10 },
        },
      });

      // Футер на каждой странице
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(
          `КиноТека • kinoteka.ru • Страница ${i} из ${pageCount}`,
          doc.internal.pageSize.getWidth() / 2,
          doc.internal.pageSize.getHeight() - 10,
          { align: "center" }
        );
      }

      // Сохраняем файл
      const fileName = `kinoteka-catalog-${new Date().toISOString().split("T")[0]}.pdf`;
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
      disabled={isExporting}
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
      {isExporting ? "Создание PDF..." : "Экспорт в PDF"}
    </Button>
  );
}

