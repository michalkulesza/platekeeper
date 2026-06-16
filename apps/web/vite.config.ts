import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { sentryVitePlugin } from "@sentry/vite-plugin";

export default defineConfig({
  build: {
    sourcemap: true,
  },
  plugins: [tailwindcss(), react(), sentryVitePlugin({ telemetry: false })],
  server: {
    port: 5173,
    host: true,
     proxy: {
      "/api": {
        target: "http://localhost:8088",
        changeOrigin: true,
      },
    },
  },
});
