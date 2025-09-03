import {heroui} from "@heroui/theme"

/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)"],
        mono: ["var(--font-mono)"],
      },
    },
  },
  darkMode: "class",
  plugins: [heroui({
      themes: {
          "light": {
              "colors": {
                  "default": {
                      "50": "#fafafa",
                      "100": "#f4f4f5",
                      "200": "#e5e5e7",
                      "300": "#d4d4d8",
                      "400": "#a1a1aa",
                      "500": "#71717a",
                      "600": "#52525b",
                      "700": "#3f3f46",
                      "800": "#27272a",
                      "900": "#18181b",
                      "foreground": "#000",
                      "DEFAULT": "#e5e5e7"
                  },
                  "primary": {
                      "50": "#fffdea",
                      "100": "#fff7c2",
                      "200": "#ffef99",
                      "300": "#ffe766",
                      "400": "#ffdf33",
                      "500": "#fde047",  // cyber yellow
                      "600": "#d1b93b",
                      "700": "#a4922e",
                      "800": "#786a22",
                      "900": "#4c4315",
                      "foreground": "#000",
                      "DEFAULT": "#fde047"
                  },
                  "secondary": {
                      "50": "#f7f2fc",
                      "100": "#ede0fa",
                      "200": "#d9bff5",
                      "300": "#c49def",
                      "400": "#ae7bea",
                      "500": "#a855f7",  // neon purple
                      "600": "#8b46cc",
                      "700": "#6d37a1",
                      "800": "#502875",
                      "900": "#321a4a",
                      "foreground": "#fff",
                      "DEFAULT": "#a855f7"
                  },
                  "success": {
                      "50": "#ecfdf5",
                      "100": "#d1fae5",
                      "200": "#a7f3d0",
                      "300": "#6ee7b7",
                      "400": "#34d399",
                      "500": "#10b981",   // softer neon green
                      "600": "#059669",
                      "700": "#047857",
                      "800": "#065f46",
                      "900": "#064e3b",
                      "foreground": "#000",
                      "DEFAULT": "#10b981"
                  },
                  "warning": {
                      "50": "#fffbeb",
                      "100": "#fef3c7",
                      "200": "#fde68a",
                      "300": "#fcd34d",
                      "400": "#fbbf24",
                      "500": "#f59e0b",   // amber orange
                      "600": "#d97706",
                      "700": "#b45309",
                      "800": "#92400e",
                      "900": "#78350f",
                      "foreground": "#000",
                      "DEFAULT": "#f59e0b"
                  },
                  "danger": {
                      "50": "#fdf2f8",
                      "100": "#fce7f3",
                      "200": "#fbcfe8",
                      "300": "#f9a8d4",
                      "400": "#f472b6",
                      "500": "#ec4899",   // neon pinkish red
                      "600": "#db2777",
                      "700": "#be185d",
                      "800": "#9d174d",
                      "900": "#831843",
                      "foreground": "#fff",
                      "DEFAULT": "#ec4899"
                  },
                  "background": "#ffffff",
                  "foreground": "#000000",
                  "content1": {
                      "DEFAULT": "#ffffff",
                      "foreground": "#000"
                  },
                  "content2": {
                      "DEFAULT": "#f9fafb",
                      "foreground": "#000"
                  },
                  "content3": {
                      "DEFAULT": "#f3f4f6",
                      "foreground": "#000"
                  },
                  "content4": {
                      "DEFAULT": "#e5e7eb",
                      "foreground": "#000"
                  },
                  "focus": "#a855f7",   // neon cyan (呼应 dark)
                  "overlay": "#000000"
              }
          },
          "dark": {
              "colors": {
                  "default": {
                      "50": "#0d0d0e",
                      "100": "#19191c",
                      "200": "#26262a",
                      "300": "#323238",
                      "400": "#3f3f46",
                      "500": "#52525b",
                      "600": "#71717a",
                      "700": "#a1a1aa",
                      "800": "#d4d4d8",
                      "900": "#ffffff",
                      "foreground": "#fff",
                      "DEFAULT": "#3f3f46"
                  },
                  "primary": {
                      "50": "#403600",
                      "100": "#726000",
                      "200": "#a38a00",
                      "300": "#d4b600",
                      "400": "#fde047",
                      "500": "#fedf1a",
                      "600": "#ffe633",
                      "700": "#ffef66",
                      "800": "#fff7b0",
                      "900": "#fffde8",
                      "foreground": "#000",
                      "DEFAULT": "#fde047"
                  },
                  "secondary": {
                      "50": "#321a4a",
                      "100": "#502875",
                      "200": "#6d37a1",
                      "300": "#8b46cc",
                      "400": "#a855f7",
                      "500": "#bb4dff",
                      "600": "#d17fff",
                      "700": "#e3aaff",
                      "800": "#f1cfff",
                      "900": "#f8e9ff",
                      "foreground": "#fff",
                      "DEFAULT": "#a855f7"
                  },
                  "success": {
                      "50": "#003326",
                      "100": "#00664d",
                      "200": "#009966",
                      "300": "#00cc80",
                      "400": "#00f59c",
                      "500": "#1affa8",
                      "600": "#4dffbb",
                      "700": "#80ffcf",
                      "800": "#b3ffe2",
                      "900": "#e6fff5",
                      "foreground": "#000",
                      "DEFAULT": "#00f59c"
                  },
                  "warning": {
                      "50": "#332000",
                      "100": "#664000",
                      "200": "#995f00",
                      "300": "#cc7f00",
                      "400": "#ff9e00",
                      "500": "#ffad33",
                      "600": "#ffc266",
                      "700": "#ffdca8",
                      "800": "#ffeccc",
                      "900": "#fff5e6",
                      "foreground": "#fff",
                      "DEFAULT": "#ff9e00"
                  },
                  "danger": {
                      "50": "#330917",
                      "100": "#66132f",
                      "200": "#991a46",
                      "300": "#cc225e",
                      "400": "#ff2975",
                      "500": "#ff4d88",
                      "600": "#ff80aa",
                      "700": "#ffb3cc",
                      "800": "#ffd6e6",
                      "900": "#ffe6ef",
                      "foreground": "#fff",
                      "DEFAULT": "#ff2975"
                  },
                  "background": "#000000",
                  "foreground": "#ffffff",
                  "focus": "#c084fc",
                  "overlay": "#ffffff"
              }
          }
      },
      layout: {
          "disabledOpacity": "0.5"
      }
  })],
}

module.exports = config;