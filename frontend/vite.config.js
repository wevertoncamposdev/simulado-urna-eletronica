import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const srcPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), 'src');

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: { alias: { '@': srcPath } },
  // host: true faz o Vite escutar em todas as interfaces (não só localhost) —
  // necessário pra abrir o app a partir de outro aparelho na mesma rede.
  server: { port: 5173, host: true },
});
