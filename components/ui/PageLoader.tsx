"use client";

import { LoadingSpinner } from "./LoadingSpinner";

export function PageLoader() {
  return (
    <div className="fixed inset-0 bg-[#141414]/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <LoadingSpinner size="lg" text="Загрузка..." />
    </div>
  );
}

