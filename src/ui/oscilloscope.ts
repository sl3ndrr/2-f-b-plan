// Draws the two waves and applies credit ratios to their SVG clips.
const width = 1000;
const height = 120;
const namespace = 'http://www.w3.org/2000/svg';

function svg<K extends keyof SVGElementTagNameMap>(tag: K, attributes: Record<string, string>) {
  const node = document.createElementNS(namespace, tag);
  for (const [key, value] of Object.entries(attributes)) node.setAttribute(key, value);
  return node;
}

export function createOscilloscope() {
  const node = svg('svg', {
    id: 'wv',
    viewBox: `0 0 ${width} ${height}`,
    preserveAspectRatio: 'none',
    'aria-hidden': 'true',
  });
  const defs = svg('defs', {});
  node.append(defs);
  const waves = ['phy', 'inf'].map((color) => {
    const id = `wave-${color}`;
    const rect = svg('rect', { width: '0', height: String(height) });
    const clip = svg('clipPath', { id });
    clip.append(rect);
    defs.append(clip);
    const dim = svg('path', { class: 'dim' });
    const active = svg('path', { class: color, 'clip-path': `url(#${id})` });
    node.append(dim, active);
    return { rect, dim, active };
  });

  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let phase = 0;
  function draw() {
    const paths = ['', ''];
    for (let x = 0; x <= width; x += 5) {
      const angle = x * 0.03 + phase;
      const command = x ? 'L' : 'M';
      paths[0] += `${command}${x} ${(34 + 20 * Math.sin(angle)).toFixed(1)}`;
      paths[1] += `${command}${x} ${Math.sin(angle * 0.8) > 0 ? 80 : 108}`;
    }
    waves.forEach(({ dim, active }, index) => {
      dim.setAttribute('d', paths[index]);
      active.setAttribute('d', paths[index]);
    });
    if (!reduced.matches) {
      phase += 0.03;
      requestAnimationFrame(draw);
    }
  }
  draw();

  return {
    node,
    update(physics: number, computing: number) {
      waves[0].rect.setAttribute('width', String(width * physics));
      waves[1].rect.setAttribute('width', String(width * computing));
    },
  };
}
