import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { semiTheming } from "vite-plugin-semi-theming";

export default defineConfig({
  base: "./",
  plugins: [
    react(),
    semiTheming({
      theme: "@semi-bot/semi-theme-feishu-dashboard",
    }),
  ],
});