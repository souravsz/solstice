import { useEffect, useState } from 'react';

/**
 * Width of an element in CSS pixels, kept up to date with ResizeObserver.
 * Returns a callback ref to attach and the current width (0 until measured).
 */
export function useElementWidth() {
  const [node, setNode] = useState(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    if (!node) return undefined;
    const observer = new ResizeObserver(([entry]) => setWidth(Math.round(entry.contentRect.width)));
    observer.observe(node);
    return () => observer.disconnect();
  }, [node]);

  return [setNode, width];
}
