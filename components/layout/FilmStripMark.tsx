import type { SVGProps } from "react";

/** Иконка киноплёнки для красного маркера логотипа (`currentColor` = белый на фоне #e50914). */
export function FilmStripMark({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
      {...props}
    >
      <rect x="5" y="3.5" width="14" height="17" rx="1.5" stroke="currentColor" strokeWidth="1.65" />
      <rect x="9" y="7.5" width="6" height="9" rx="0.5" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M7.25 5.5v1.6M7.25 9.2v1.6M7.25 12.9v1.6M7.25 16.6v1.6M16.75 5.5v1.6M16.75 9.2v1.6M16.75 12.9v1.6M16.75 16.6v1.6"
        stroke="currentColor"
        strokeWidth="1.35"
        strokeLinecap="round"
      />
    </svg>
  );
}
