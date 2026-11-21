import vue from '@vitejs/plugin-vue'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'

const HERE = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
    root: HERE,
    plugins: [vue()],
    build: {outDir: resolve(HERE, '.dist'), emptyOutDir: true, minify: 'esbuild', assetsInlineLimit: 0}
})
