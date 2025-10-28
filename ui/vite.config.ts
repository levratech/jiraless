import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Build for subdomain root: https://jiraless.levratech.com/
export default defineConfig({
  base: process.env.VITE_BASE ?? "/",
  plugins: [react()],
  build: {
    outDir: "dist",
    sourcemap: true
  }
});