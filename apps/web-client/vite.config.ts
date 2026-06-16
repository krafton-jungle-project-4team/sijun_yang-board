import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

export default defineConfig({
    plugins: [tanstackRouter(), react(), tailwindcss()],
    server: {
        port: 5173,
        proxy: {
            "/api": "http://localhost:4000"
        }
    },
    preview: {
        port: 4173,
        proxy: {
            "/api": "http://localhost:4000"
        }
    }
});
