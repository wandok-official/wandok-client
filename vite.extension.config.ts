import { defineConfig } from 'vite';
import { resolve } from 'path';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import hotReloadExtension from 'hot-reload-extension-vite';

// 익스텐션용 Vite 설정
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    hotReloadExtension({
      log: true,
      backgroundPath: resolve(__dirname, 'apps/extension/src/background.ts'),
    }),
  ],
  build: {
    outDir: 'apps/extension/dist',
    emptyOutDir: true,

    // 소스맵 생성 여부 (배포 시 false로 변경 필요)
    sourcemap: 'inline',

    rollupOptions: {
      input: {
        background: resolve(__dirname, 'apps/extension/src/background.ts'),
        content: resolve(__dirname, 'apps/extension/src/content.tsx'),
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
        assetFileNames: '[name].[ext]',
      },
    },
  },
  publicDir: 'apps/extension/public',
});
