// apps/web/tailwind.config.ts
import type { Config } from "tailwindcss";

export default {
  content: [
  "./app/**/*.{js,ts,jsx,tsx,mdx}",
  "./components/**/*.{js,ts,jsx,tsx,mdx}",
  "./features/**/*.{js,ts,jsx,tsx,mdx}",
  "./shared/**/*.{js,ts,jsx,tsx,mdx}",
  "../../packages/study-ui-web/src/**/*.{js,ts,jsx,tsx,mdx}",
  "../../packages/study-core/src/**/*.{js,ts,jsx,tsx,mdx}",  // ADD THIS
],
  theme: {
    extend: {},
  },
  plugins: [],
} satisfies Config;