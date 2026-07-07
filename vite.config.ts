import { defineConfig } from "vite";

export default defineConfig({
  build: {
    target: "es2022",
    outDir: "dist",
    emptyOutDir: true,
    sourcemap: true,
    lib: {
      entry: "src/main.ts",
      formats: ["es"],
      fileName: () => "main.js",
    },
    rollupOptions: {
      output: {
        entryFileNames: "main.js",
      },
    },
  },
});
