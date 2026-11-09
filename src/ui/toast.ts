// Shows transient status messages in the existing live region.
export function createToast(node: HTMLElement) {
  let timeout: number;
  return (message: string) => {
    node.textContent = message;
    node.classList.add('on');
    window.clearTimeout(timeout);
    timeout = window.setTimeout(() => node.classList.remove('on'), 3000);
  };
}
