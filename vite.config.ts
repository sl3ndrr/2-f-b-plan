import { resolve, sep } from 'node:path';
import { defineConfig } from 'vite';
import { loadData } from './scripts/data-loader.ts';

const virtualId = 'virtual:study-data';
const resolvedId = '\0' + virtualId;
const dataDirectory = resolve('data') + sep;

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
        handleHotUpdate({ file, server }) {
          if (!file.startsWith(dataDirectory)) return;
          const module = server.moduleGraph.getModuleById(resolvedId);
          if (module) server.moduleGraph.invalidateModule(module);
          server.ws.send({ type: 'full-reload' });
          return [];
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
