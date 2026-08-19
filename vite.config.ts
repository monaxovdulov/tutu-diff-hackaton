import { defineConfig } from "vite";

export default defineConfig({
  build: {
    target: "es2021",
    sourcemap: true,
    rollupOptions: {
      input: {
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
