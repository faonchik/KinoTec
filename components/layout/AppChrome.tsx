"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CinematicSidebar } from "@/components/layout/CinematicSidebar";
import { AIChatButton } from "@/components/ai/AIChatButton";

/**
 * Full-bleed cinematic preview without site chrome.
 */
export function AppChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isStreamingPreview = pathname === "/streaming-preview" || pathname.startsWith("/streaming-preview/");
  /** Полноэкранные страницы входа/регистрации — без сайдбара и общего футера, как отдельный портал */
  const isAuthPortal = pathname === "/auth" || pathname.startsWith("/auth/");
  const isAdmin = pathname === "/admin" || pathname.startsWith("/admin/");

  if (isStreamingPreview) {
    return <>{children}</>;
  }

  if (isAuthPortal) {
    return (
      <>
        {children}
        <AIChatButton />
      </>
    );
  }

  if (isAdmin) {
    return (
      <>
        <Header />
        {children}
        <AIChatButton />
      </>
    );
  }

  return (
    <>
      <div
        className="relative flex min-h-screen flex-1 flex-col text-white selection:bg-[#ffb84d]/30 selection:text-white sm:flex-row"
        style={{ backgroundColor: "#141414" }}
      >
        <div
          className="pointer-events-none fixed inset-0 z-0 opacity-70"
          aria-hidden
          style={{
            background: "linear-gradient(180deg, rgba(0,0,0,0.4) 0%, transparent 28%), radial-gradient(ellipse 100% 40% at 50% 0%, rgba(229,9,20,0.12), transparent 55%)",
          }}
        />
        <CinematicSidebar />
        <div className="relative flex min-h-0 min-w-0 flex-1 flex-col">
          <Header />
          <main className="relative z-0 min-w-0 flex-1 overflow-x-hidden [isolation:isolate]">{children}</main>
          <Footer />
        </div>
      </div>
      <AIChatButton />
    </>
  );
}
