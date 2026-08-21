import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  plugins: [react()],
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
  },
  build: {
    outDir: 'wordpress-plugin/neo-ai-chatbot/assets',
    emptyOutDir: true,
    lib: {
      entry: resolve(__dirname, 'src/widget.jsx'),
      name: 'NeoChatWidget',
      fileName: () => 'neo-chat-widget.js',
      formats: ['iife'],
    },
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          if (assetInfo.name && assetInfo.name.endsWith('.css')) {
            return 'neo-chat-widget.css';
          }
          return '[name][extname]';
        },
      },
    },
  },
});
