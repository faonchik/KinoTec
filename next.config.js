const createNextIntlPlugin = require("next-intl/plugin");
const path = require("node:path");

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");
const projectRoot = path.resolve(__dirname);

const isDockerNextBuild = process.env.NEXTJS_DOCKER_BUILD === "true";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // В образе next build без полной БД: ESLint/TS проверяйте локально или в CI
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  output: "standalone",
  // Явно фиксируем корень проекта, чтобы Next.js не выбирал родительскую папку по lockfile
  outputFileTracingRoot: projectRoot,
  turbopack: {
    root: projectRoot,
  },

  // Отключаем вывод информации о версии Next.js в заголовках
  poweredByHeader: false,

  // Настройки для production
  compress: true,

  // Конфигурация для внешних изображений
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "image.tmdb.org",
        pathname: "/t/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
    unoptimized: false,
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
  },

  // Security headers и кеширование для статических файлов
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
      // Кеширование для статических ресурсов
      {
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      // Кеширование для изображений
      {
        source: "/api/images/proxy",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800",
          },
        ],
      },
      // Кеширование для API изображений Next.js
      {
        source: "/_next/image",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

module.exports = withNextIntl(nextConfig);
