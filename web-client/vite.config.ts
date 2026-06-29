import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
    plugins: [react(), tailwindcss()],
    resolve: {
        alias: {
            "#components": path.resolve(__dirname, "./src/components"),
            "#hooks": path.resolve(__dirname, "./src/hooks"),
            "#state": path.resolve(__dirname, "./src/state"),
            "#services": path.resolve(__dirname, "./src/services"),
            "#types": path.resolve(__dirname, "./src/types"),
        },
    },
    server: {
        port: 5173,
        strictPort: false,

        // Proxy API calls to the Go backend
        // Example: http://localhost:5173/api/signup → http://localhost:8081/api/signup
        proxy: {
            "/api": {
                target: "http://localhost:8081",
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api/, "/api"),
            },
            "/ws": {
                target: "ws://localhost:8081",
                ws: true,
            },
        },
    },

    build: {
        target: "ES2023",
        minify: "terser",
        sourcemap: false,
    },
});
