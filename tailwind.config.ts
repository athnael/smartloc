import type { Config } from "tailwindcss";
import forms from "@tailwindcss/forms";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#351A00",
        ocean: "#4A2300",
        sea: "#F28C00",
        land: "#FFD51E",
        mist: "#FFF8D5",
        coral: "#FF6B00",
        sand: "#FFE88A"
      },
      fontFamily: {
        sans: ["Manrope Variable", "Manrope", "ui-sans-serif", "system-ui"],
        serif: ["Sora Variable", "Sora", "ui-sans-serif", "system-ui"],
        mono: ["Manrope Variable", "Manrope", "ui-sans-serif", "system-ui"]
      },
      boxShadow: {
        float: "0 24px 70px rgba(110, 55, 0, .18)"
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.5rem"
      }
    }
  },
  plugins: [forms]
} satisfies Config;
