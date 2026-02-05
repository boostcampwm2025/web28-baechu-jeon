import { useRef, useCallback } from "react";

export function useDebouncedPrefetch(delay: number = 150) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const debouncedPrefetch = useCallback(
    (callback: () => void) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(callback, delay);
    },
    [delay],
  );

  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  return { debouncedPrefetch, cancel };
}
