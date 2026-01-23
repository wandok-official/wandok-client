import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import hotReloadExtension from 'hot-reload-extension-vite';
import { resolve } from 'path';
import { defineConfig } from 'vite';

// 익스텐션용 Vite 설정
export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    tailwindcss(),
    // hot-reload는 개발 환경에서만 활성화
    ...(mode === 'development'
      ? [
        hotReloadExtension({
          log: true,
          backgroundPath: resolve(__dirname, 'apps/extension/src/background.ts'),
        }),
      ]
      : []),
  ],
  build: {
    outDir: 'apps/extension/dist',
    emptyOutDir: true,

    // 프로덕션 빌드에서는 소스맵 제거 (파일 크기 감소, 보안)
    sourcemap: false,

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
}));
