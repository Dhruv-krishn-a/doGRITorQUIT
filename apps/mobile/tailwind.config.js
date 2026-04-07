/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        obsidian: "#0B0F19",
        "slate-surface": "#1E293B",
        "sky-focus": "#0EA5E9",
        mint: "#10B981",
        amber: "#F59E0B",
      },
    },
  },
  plugins: [],
}