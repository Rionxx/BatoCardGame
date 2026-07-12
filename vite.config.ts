/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// オンライン対戦の通信はSupabase Realtimeに移行したため、
// 以前ここに組み込んでいた開発用WebSocket中継サーバーは撤去した。
export default defineConfig({
  plugins: [react()],
  server: { host: "0.0.0.0" },
  test: {
    environment: "node",
  },
});
