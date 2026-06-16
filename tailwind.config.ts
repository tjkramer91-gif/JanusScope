import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#1d1d1f",
        paper: "#f5f5f7",
        steel: "#0071e3",
        steelDark: "#0066cc",
        pine: "#1d1d1f",
        moss: "#6e6e73",
        line: "#d2d2d7",
        amber: "#a56b00",
        brick: "#b42318",
      },
      boxShadow: {
        card: "0 18px 48px rgba(0, 0, 0, 0.055)",
        lift: "0 22px 60px rgba(0, 0, 0, 0.09)",
      },
    },
  },
  plugins: [],
};

export default config;
