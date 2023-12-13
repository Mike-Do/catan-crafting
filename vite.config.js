// all files are in ./. There is no src/ or public/ folder. We have the ./assets folder for images and the ./components folder for the components. 
// Create a config file to work with this setup.

import { defineConfig } from "vite";

export default defineConfig({
    root: "./",
    base: "./",
    build: {
        outDir: "dist",
        assetsDir: "assets",
        rollupOptions: {
        input: {
            main: "./index.html",
        },
        },
    },
    });

