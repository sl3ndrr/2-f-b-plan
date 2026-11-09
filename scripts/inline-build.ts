import { readFileSync, rmSync, writeFileSync } from 'node:fs';
import { basename, join } from 'node:path';

const output = 'dist-single';
const index = join(output, 'index.html');
const assets = join(output, 'assets');
const html = readFileSync(index, 'utf8');
let scripts = 0;
let styles = 0;

function readAsset(src: string) {
  return readFileSync(join(assets, basename(src)), 'utf8');
}

const inlined = html
  .replace(/<script\b[^>]*src="([^"]+)"[^>]*><\/script>/g, (_, src: string) => {
    scripts++;
    return `<script type="module">${readAsset(src).replace(/<\/script/gi, '<\\/script')}</script>`;
  })
  .replace(/<link\b(?=[^>]*rel="stylesheet")[^>]*href="([^"]+)"[^>]*>/g, (_, href: string) => {
    styles++;
    return `<style>${readAsset(href)}</style>`;
  });

if (scripts !== 1 || styles !== 1 || /(?:src|href)="\.\/assets\//.test(inlined)) {
  throw new Error(
    'Offline-Build erwartet genau ein Script und ein Stylesheet ohne externe Assets.',
  );
}
writeFileSync(index, inlined);
rmSync(assets, { recursive: true });
