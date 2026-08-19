import { defineConfig } from "vite";

export default defineConfig({
  server: {
    proxy: {
      "/api": "http://127.0.0.1:8787"
    }
  },
  build: {
    target: "es2021",
    sourcemap: true,
    rollupOptions: {
      input: {
        page: "index.html",
        index: "src/index.ts",
        "tutu-diff-widget.esm": "src/tutu-diff-widget.esm.ts",
        loader: "src/loader.ts"
      },
      output: {
        entryFileNames: "[name].js",
        chunkFileNames: "chunks/[name]-[hash].js"
      }
    }
  }
});
