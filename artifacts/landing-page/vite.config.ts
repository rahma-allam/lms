import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// 1. جعل المنافذ والمسارات اختيارية لتجنب الـ Crash
const port = Number(process.env.PORT) || 5173;
const basePath = process.env.BASE_PATH || "/";

export default defineConfig({
  base: basePath,
  plugins: [
    react(),
    tailwindcss(),
    // تم حذف إضافات Replit (cartographer, dev-banner, runtimeErrorOverlay)
    // لأنها تسبب مشاكل Native Bindings على الويندوز
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
      "@assets": path.resolve(import.meta.dirname, "..", "..", "attached_assets"),
    },
    dedupe: ["react", "react-dom"],
  },
  root: path.resolve(import.meta.dirname),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    port,
    strictPort: false, // غيرناها لـ false عشان لو البورت مشغول يختار غيره
    host: "localhost", // أفضل للويندوز من 0.0.0.0
    fs: {
      strict: true,
    },
  },
  preview: {
    port,
    host: "localhost",
  },
});