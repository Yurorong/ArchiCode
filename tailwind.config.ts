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
          50: "#f2f7fb",
          100: "#dce9f4",
          500: "#2f6f9f",
          700: "#1f4f73",
          900: "#14334a",
        },
      },
      boxShadow: {
        panel: "0 20px 45px rgba(20, 51, 74, 0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
