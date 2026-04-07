import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./features/**/*.{js,ts,jsx,tsx,mdx}",
    "./shared/**/*.{js,ts,jsx,tsx,mdx}",
    "../../packages/study-ui-web/src/**/*.{js,ts,jsx,tsx,mdx}",
    "../../packages/study-core/src/**/*.{js,ts,jsx,tsx,mdx}",
    "../../packages/notes-ui-web/src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        obsidian: "#0B0F19",
        "slate-surface": "#1E293B",
        "sky-focus": "#0EA5E9",
        mint: "#10B981",
        amber: "#F59E0B",
      },
      spacing: {
        150: '37.5rem',
        200: '50rem',
      },
      zIndex: {
        sidebar: '30',
        header: '40',
        shell: '900',
        modal: '1200',
        toast: '1300',
      },
      animation: {
        'swirl-slow': 'swirl 10s linear infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        swirl: {
          '0%': { backgroundPosition: '0% 50%' },
          '100%': { backgroundPosition: '100% 50%' },
        },
      },
      letterSpacing: {
        tightest: '-.075em',
      }
    },
  },
  plugins: [typography],
} satisfies Config;