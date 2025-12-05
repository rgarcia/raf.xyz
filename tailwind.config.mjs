import defaultTheme from "tailwindcss/defaultTheme";

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", ...defaultTheme.fontFamily.sans],
        serif: ["Lora", ...defaultTheme.fontFamily.serif],
      },
      // remove the implicit quoting of blockquotes
      typography: {
        DEFAULT: {
          css: {
            blockquote: {
              quotes: "none",
            },
            "blockquote p:first-of-type::before": {
              content: "none",
            },
            "blockquote p:last-of-type::after": {
              content: "none",
            },
          },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
