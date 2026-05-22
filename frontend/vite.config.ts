import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
  },
  resolve: {
    alias: {
      events: "rollup-plugin-node-polyfills/polyfills/events",
    },
  },
});