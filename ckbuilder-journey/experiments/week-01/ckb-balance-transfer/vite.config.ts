import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Plain Vite + React setup. The CKB devnet RPC is reached at
// http://127.0.0.1:28114 (offCKB's CORS-enabled proxy), so no dev proxy needed.
export default defineConfig({
  plugins: [react()],
  server: { port: 5173 },
});
