// filepath: d:\My Personal Projects\IT342-G5-Cartella\frontend-web\cartella-frontend\vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:8080", // Your backend server
        changeOrigin: true,
        secure: false,
      },
    },
  },
});