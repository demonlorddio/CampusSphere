import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      boxShadow: {
        soft: "0 18px 60px -30px rgba(32, 48, 45, 0.32)",
      },
    },
  },
  plugins: [],
};

export default config;
