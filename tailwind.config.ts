import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        cine: {
          bg: "var(--cine-bg)",
          surface: "var(--cine-surface)",
          accent: "var(--cine-accent)",
          muted: "var(--cine-muted)",
        },
      },
        fontFamily: {
        oswald: ['Oswald', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        display: ["var(--font-sp-display)", "Oswald", "system-ui", "sans-serif"],
        sans: ["var(--font-sp-body)", "Inter", "system-ui", "sans-serif"],
      },
      screens: {
        'xs': '475px',
      },
    },
  },
  plugins: [],
};
export default config;
