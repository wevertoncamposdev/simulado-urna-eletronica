import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const srcPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), 'src');

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: { alias: { '@': srcPath } },
  server: { port: 5173 },
});
