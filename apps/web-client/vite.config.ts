import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

export default defineConfig({
    plugins: [tanstackRouter({ autoCodeSplitting: true }), react(), tailwindcss()],
    resolve: {
        alias: {
            "@": fileURLToPath(new URL("./src", import.meta.url))
        }
    },
    build: {
        rolldownOptions: {
            output: {
                codeSplitting: {
                    groups: [
                        {
                            name: "vendor-react",
                            test: /node_modules[\\/](react|react-dom)[\\/]/,
                            priority: 30
                        },
                        {
                            name: "vendor-tanstack",
                            test: /node_modules[\\/]@tanstack[\\/]/,
                            priority: 20
                        },
                        {
                            name: "vendor-ui",
                            test: /node_modules[\\/](radix-ui|lucide-react|class-variance-authority|clsx|tailwind-merge)[\\/]/,
                            priority: 10
                        },
                        {
                            name: "vendor",
                            test: /node_modules[\\/]/,
                            minSize: 20_000
                        }
                    ]
                }
            }
        }
    },
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
