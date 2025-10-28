import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Build for subdomain root: https://jiraless.levratech.com/
export default defineConfig({
  base: "/",                 // <-- was "/jiraless/"
  plugins: [react()],
  build: {
    outDir: "dist",
    sourcemap: true
  }
});