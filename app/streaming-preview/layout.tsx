import type { ReactNode } from "react";
import { Syne, DM_Sans } from "next/font/google";

const syne = Syne({
  subsets: ["latin", "latin-ext"],
  variable: "--font-sp-display",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin", "latin-ext"],
  variable: "--font-sp-body",
  display: "swap",
});

export default function StreamingPreviewLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className={`${syne.variable} ${dmSans.variable} font-[family-name:var(--font-sp-body)]`}>
      {children}
    </div>
  );
}
