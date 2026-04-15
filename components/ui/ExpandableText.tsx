"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

interface ExpandableTextProps {
  text: string;
  maxLength?: number;
  className?: string;
}

export function ExpandableText({ text, maxLength = 500, className = "" }: ExpandableTextProps) {
  const t = useTranslations("common");
  const [isExpanded, setIsExpanded] = useState(false);
  
  const shouldTruncate = text.length > maxLength;
  const displayText = shouldTruncate && !isExpanded 
    ? text.slice(0, maxLength).trim() + "..."
    : text;

  if (!shouldTruncate) {
    return <p className={className}>{text}</p>;
  }

  return (
    <div>
      <p className={className}>
        {displayText}
      </p>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="mt-2 text-amber-400 hover:text-amber-300 text-sm font-medium transition-colors"
      >
        {isExpanded ? t("showLess") : t("showMore")}
      </button>
    </div>
  );
}

