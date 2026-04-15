import Link from "next/link";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  baseUrl: string;
}

export function Pagination({ currentPage, totalPages, baseUrl }: PaginationProps) {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const showPages = 5;
    
    if (totalPages <= showPages + 2) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      
      if (currentPage > 3) {
        pages.push("...");
      }
      
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      if (currentPage < totalPages - 2) {
        pages.push("...");
      }
      
      pages.push(totalPages);
    }
    
    return pages;
  };

  const getPageUrl = (page: number) => {
    const url = new URL(baseUrl, "http://localhost");
    url.searchParams.set("page", page.toString());
    return `${url.pathname}${url.search}`;
  };

  return (
    <nav className="flex items-center gap-2">
      {/* Prev */}
      <Link
        href={getPageUrl(Math.max(1, currentPage - 1))}
        className={`font-mono text-[13px] px-3 py-2 rounded-lg transition-colors ${
          currentPage === 1
            ? "text-[#3A4560] pointer-events-none"
            : "text-[#8B95A8] hover:text-white hover:bg-[#2A3550]"
        }`}
      >
        Назад
      </Link>

      {getPageNumbers().map((page, index) => (
        typeof page === "number" ? (
          <Link
            key={index}
            href={getPageUrl(page)}
            className={`min-w-[36px] h-9 flex items-center justify-center rounded-lg font-mono text-[13px] font-medium transition-colors ${
              page === currentPage
                ? "bg-[#FF8400] text-white"
                : "text-[#8B95A8] hover:text-white hover:bg-[#2A3550]"
            }`}
          >
            {page}
          </Link>
        ) : (
          <span key={index} className="px-1 text-[#5A6478] font-mono text-[13px]">
            {page}
          </span>
        )
      ))}

      {/* Next */}
      <Link
        href={getPageUrl(Math.min(totalPages, currentPage + 1))}
        className={`font-mono text-[13px] px-3 py-2 rounded-lg transition-colors ${
          currentPage === totalPages
            ? "text-[#3A4560] pointer-events-none"
            : "text-[#FF8400] hover:text-[#FF9F2E] hover:bg-[#2A3550]"
        }`}
      >
        Далее &gt;
      </Link>
    </nav>
  );
}
