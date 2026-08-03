import { defineConfig } from "vite"
import { fileURLToPath } from "node:url"

export default defineConfig({
  build: {
    lib: {
      entry: fileURLToPath(new URL("./src/main.ts", import.meta.url)),
      formats: ["es"],
      fileName: () => "index.js",
    },
    outDir: "dist",
    emptyOutDir: true,
    target: "es2020",
    minify: false,
  },
})
