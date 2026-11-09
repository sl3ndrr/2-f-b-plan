import { defineConfig } from 'vite';
import { loadData } from './scripts/data-loader.ts';

const virtualId = 'virtual:study-data';
const resolvedId = '\0' + virtualId;

export default defineConfig(({ mode }) => {
  const single = mode === 'single';
  return {
    base: single ? './' : '/2-f-b-plan/',
    plugins: [
      {
        name: 'validated-study-data',
        resolveId(id) {
          if (id === virtualId) return resolvedId;
        },
        load(id) {
          if (id === resolvedId) return `export const data = ${JSON.stringify(loadData())};`;
        },
      },
    ],
    build: single
      ? {
          outDir: 'dist-single',
          assetsInlineLimit: Number.POSITIVE_INFINITY,
          cssCodeSplit: false,
          modulePreload: false,
        }
      : {},
  };
});
