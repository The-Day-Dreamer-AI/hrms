import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import mkcert from 'vite-plugin-mkcert'

export default defineConfig({
  plugins: [react()],
  server: { port: 3000 },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})

