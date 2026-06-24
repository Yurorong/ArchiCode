import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef2f6",
          100: "#dde5ec",
          500: "#4f6a82",
          700: "#24384d",
          900: "#192a3a",
        },
      },
      boxShadow: {
        panel: "0 24px 60px rgba(26, 32, 37, 0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
