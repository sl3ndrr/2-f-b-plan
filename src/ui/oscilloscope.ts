// Builds fixed periodic paths and updates the progress clips in the oscilloscope SVG.
const width = 1000;
const height = 120;
const namespace = 'http://www.w3.org/2000/svg';

function svg<K extends keyof SVGElementTagNameMap>(tag: K, attributes: Record<string, string>) {
  const node = document.createElementNS(namespace, tag);
  for (const [key, value] of Object.entries(attributes)) node.setAttribute(key, value);
  return node;
}

function sinePath(period: number) {
  const points = [];
  for (let x = 0; x <= width + period; x += 5) {
    const y = 34 + 20 * Math.sin((x / period) * 2 * Math.PI);
    points.push(`${x ? 'L' : 'M'}${x} ${y.toFixed(1)}`);
  }
  return points.join('');
}

function squarePath(period: number) {
  let path = 'M0 80';
  for (let x = 0; x < width + period; x += period) {
    path += `H${x + period / 2}V108H${x + period}V80`;
  }
  return path;
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

  const waves = [
    { color: 'phy', period: 210, draw: sinePath },
    { color: 'inf', period: 260, draw: squarePath },
  ].map(({ color, period, draw }) => {
    const id = `wave-${color}`;
    const rect = svg('rect', { width: '0', height: String(height) });
    const clip = svg('clipPath', { id });
    clip.append(rect);
    defs.append(clip);

    const path = draw(period);
    const dim = svg('path', { class: 'dim wave', d: path });
    const active = svg('path', { class: `${color} wave`, d: path });
    for (const line of [dim, active]) line.style.setProperty('--wave-shift', `-${period}px`);
    // The fixed parent clip keeps its credit boundary when the path translates.
    const mask = svg('g', { 'clip-path': `url(#${id})` });
    mask.append(active);
    node.append(dim, mask);
    return rect;
  });

  return {
    node,
    update(physics: number, computing: number) {
      waves[0].setAttribute('width', String(width * physics));
      waves[1].setAttribute('width', String(width * computing));
    },
  };
}
