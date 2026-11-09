// Creates DOM nodes from text and assigns their category color.
export function element<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className = '',
  text?: string,
) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

export function get<T extends Element = HTMLElement>(selector: string) {
  const node = document.querySelector<T>(selector);
  if (!node) throw new Error(`Fehlender DOM-Knoten: ${selector}`);
  return node;
}

export function color<T extends HTMLElement>(node: T, token: string) {
  node.style.setProperty('--c', `var(--${token})`);
  return node;
}
