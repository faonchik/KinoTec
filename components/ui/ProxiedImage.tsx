"use client";

import Image from "next/image";
import { getProxiedImageUrl, shouldUseUnoptimized } from "@/lib/images";

interface ProxiedImageProps extends React.ComponentProps<typeof Image> {
  src: string | null | undefined;
}

/**
 * Компонент для отображения изображений с автоматическим проксированием TMDB изображений
 * Использует обычный img для проксированных изображений, чтобы избежать проблем с Next.js Image оптимизатором
 */
export function ProxiedImage({ src, ...props }: ProxiedImageProps) {
  if (!src) {
    return null;
  }

  const proxiedUrl = getProxiedImageUrl(src);
  const isProxied = shouldUseUnoptimized(proxiedUrl);

  // Для проксированных изображений используем обычный img, чтобы избежать проблем с Next.js Image
  if (isProxied && proxiedUrl) {
    const { fill, width, height, sizes, ...imgProps } = props;
    
    if (fill) {
      return (
        <img
          src={proxiedUrl}
          alt={props.alt || ""}
          className={props.className}
          style={{ ...props.style, objectFit: "cover", width: "100%", height: "100%" }}
          loading={props.priority ? "eager" : "lazy"}
        />
      );
    }

    return (
      <img
        src={proxiedUrl}
        alt={props.alt || ""}
        width={width}
        height={height}
        className={props.className}
        style={props.style}
        loading={props.priority ? "eager" : "lazy"}
      />
    );
  }

  // Для обычных изображений используем Next.js Image
  return <Image src={proxiedUrl || src} {...props} unoptimized={isProxied} />;
}

