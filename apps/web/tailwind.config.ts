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
    extend: {
      // Support large glow blobs (w-200/h-150) used across dashboards/auth
      spacing: {
        150: '37.5rem', // 600px
        200: '50rem',   // 800px
      },
      // Centralize stacking so overlays sit above the shell consistently
      zIndex: {
        sidebar: '30',
        header: '40',
        shell: '900',
        modal: '1200',
        toast: '1300',
      },
    },
  },
  plugins: [],
} satisfies Config;

module.exports = {
  theme: {
    extend: {
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
}