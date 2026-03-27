import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        bg: "#090e14",
        surface: "#111820",
        surface2: "#1a2330",
        accent: "#00d4aa",
        muted: "#5a7a96",
      },
      fontFamily: {
        mono: ["DM Mono", "monospace"],
        sans: ["DM Sans", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
