import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#FF6B35",
          light: "#FF8E53",
        },
        accent: {
          DEFAULT: "#7CB342",
        },
        background: {
          cream: "#FAF8F5",
          white: "#FFFFFF",
          dark: "#1A1A1A",
          "dark-secondary": "#2D2D2D",
        },
        text: {
          primary: "#2D3436",
          secondary: "#636E72",
          tertiary: "#B2BEC3",
          "dark-primary": "#FFFFFF",
          "dark-secondary": "#A0A0A0",
          "dark-tertiary": "#666666",
        },
        success: "#00B894",
        warning: "#FDCB6E",
        error: "#D63031",
      },
      fontFamily: {
        sans: ["var(--font-plus-jakarta)", "system-ui", "sans-serif"],
        display: ["var(--font-outfit)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        "xl": "1rem",
        "2xl": "1.5rem",
        "3xl": "2rem",
      },
    },
  },
  plugins: [],
};

export default config;
