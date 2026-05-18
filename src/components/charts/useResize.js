import { useEffect, useRef, useState } from "react";

export default function useResize() {
  const ref = useRef(null);
  const [size, setSize] = useState({ width: 640, height: 320 });
  useEffect(() => {
    if (!ref.current) return undefined;
    const observer = new ResizeObserver(([entry]) => {
      const width = Math.max(280, entry.contentRect.width);
      setSize({ width, height: Math.max(260, Math.round(width * 0.48)) });
    });
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return [ref, size];
}
