import type { Config } from "tailwindcss";

export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "../**/*.{js,ts,jsx,tsx,mdx}",     // FIXED path
  ],
  theme: {
    extend: {},
  },
  plugins: [],
} satisfies Config;
