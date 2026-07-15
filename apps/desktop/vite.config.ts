import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import process from "node:process";
import obfuscator from "rollup-plugin-javascript-obfuscator";

const host = process.env.TAURI_DEV_HOST;

// https://vite.dev/config/
export default defineConfig(async ({ command }) => ({
  plugins: [
    react(),
    command === "build" &&
      obfuscator({
        compact: true,
        controlFlowFlattening: true,
        controlFlowFlatteningThreshold: 0.75,
        numbersToExpressions: true,
        simplify: true,
        stringArrayThreshold: 0.75,
        splitStrings: true,
        splitStringsChunkLength: 10,
        unicodeEscapeSequence: false,
      }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@gritorquit/study-core": path.resolve(__dirname, "../../packages/study-core/src"),
      "@gritorquit/study-ui-web": path.resolve(__dirname, "../../packages/study-ui-web/src"),
      "@gritorquit/habits-core": path.resolve(__dirname, "../../packages/habits-core/src"),
      "@gritorquit/habits-ui-web": path.resolve(__dirname, "../../packages/habits-ui-web/src"),
      "@gritorquit/notes-ui-web": path.resolve(__dirname, "../../packages/notes-ui-web/src"),
      "@gritorquit/dashboard-core": path.resolve(__dirname, "../../packages/dashboard-core/src"),
      "@gritorquit/dashboard-ui-web": path.resolve(__dirname, "../../packages/dashboard-ui-web/src"),
      "@gritorquit/domain": path.resolve(__dirname, "../../packages/domain"),
      "@gritorquit/db": path.resolve(__dirname, "../../packages/db")
    },
  },
  build: {
    sourcemap: false,
    rollupOptions: {
      external: ["html2canvas"],
      output: {
        manualChunks(id) {
          if (id.includes("/packages/notes-ui-web/")) {
            if (id.includes("/packages/notes-ui-web/src/lib/")) {
              return "notes-lib-feature";
            }

            return "notes-editor-feature";
          }

          if (id.includes("/packages/study-core/") || id.includes("/packages/study-ui-web/")) {
            return "study-feature";
          }

          if (id.includes("/packages/dashboard-core/") || id.includes("/packages/dashboard-ui-web/")) {
            return "dashboard-feature";
          }

          if (id.includes("/packages/habits-core/")) {
            return "habits-core-feature";
          }

          if (id.includes("/packages/habits-ui-web/")) {
            return "habits-ui-feature";
          }

          if (id.includes("/packages/domain/")) {
            return "domain-shared";
          }

          if (!id.includes("node_modules")) return;

          if (
            id.includes("/node_modules/prosemirror-") ||
            id.includes("/node_modules/@tiptap/pm/") ||
            id.includes("/node_modules/@handlewithcare/prosemirror-inputrules/")
          ) {
            return "prosemirror-vendor";
          }

          if (
            id.includes("/node_modules/yjs/") ||
            id.includes("/node_modules/y-prosemirror/") ||
            id.includes("/node_modules/y-protocols/")
          ) {
            return "collab-vendor";
          }

          if (
            id.includes("/node_modules/remark-") ||
            id.includes("/node_modules/rehype-") ||
            id.includes("/node_modules/unified/") ||
            id.includes("/node_modules/hast-util-") ||
            id.includes("/node_modules/unist-util-") ||
            id.includes("/node_modules/mdast-") ||
            id.includes("/node_modules/micromark") ||
            id.includes("/node_modules/decode-named-character-reference/")
          ) {
            return "markdown-vendor";
          }

          if (
            id.includes("/node_modules/@emoji-mart/data/")
          ) {
            return "emoji-data-vendor";
          }

          if (id.includes("/node_modules/emoji-mart/")) {
            return "emoji-ui-vendor";
          }

          if (
            id.includes("lowlight") ||
            id.includes("markdown-it") ||
            id.includes("turndown") ||
            id.includes("html-to-md") ||
            id.includes("tippy.js")
          ) {
            return "editor-support-vendor";
          }

          if (id.includes("@blocknote/core")) {
            return "blocknote-core-vendor";
          }

          if (id.includes("@blocknote/react") || id.includes("@blocknote/mantine")) {
            return "blocknote-ui-vendor";
          }

          if (id.includes("@tiptap")) {
            return "tiptap-vendor";
          }

          if (id.includes("@tauri-apps")) {
            return "tauri-vendor";
          }

          if (
            id.includes("framer-motion") ||
            id.includes("gsap") ||
            id.includes("@hello-pangea/dnd")
          ) {
            return "interaction-vendor";
          }

          if (
            id.includes("react-player") ||
            id.includes("react-youtube") ||
            id.includes("react-resizable-panels") ||
            id.includes("react-window") ||
            id.includes("react-virtualized-auto-sizer")
          ) {
            return "media-vendor";
          }

          if (
            id.includes("react") ||
            id.includes("react-dom") ||
            id.includes("react-router-dom")
          ) {
            return "react-vendor";
          }
        },
      },
    },
  },

  // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
  //
  // 1. prevent Vite from obscuring rust errors
  clearScreen: false,
  // 2. tauri expects a fixed port, fail if that port is not available
  server: {
    port: 1420,
    strictPort: true,
    host: host || false,
    hmr: host
      ? {
          protocol: "ws",
          host,
          port: 1421,
        }
      : undefined,
    watch: {
      // 3. tell Vite to ignore watching `src-tauri`
      ignored: ["**/src-tauri/**"],
    },
  },
}));
