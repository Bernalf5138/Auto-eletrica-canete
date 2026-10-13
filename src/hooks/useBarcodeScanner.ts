import { useEffect, useRef } from 'react';

/**
 * Hook to listen for physical USB / Bluetooth barcode scanners.
 * Most hardware barcode scanners act as keyboard input typing fast (< 50ms per key) followed by Enter.
 */
export function useBarcodeScanner(onScan: (barcode: string) => void, enabled: boolean = true) {
  const bufferRef = useRef<string>('');
  const lastTimeRef = useRef<number>(0);

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is currently typing in an input or textarea
      const target = e.target as HTMLElement;
      const isInput = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);
      
      const currentTime = Date.now();
      const timeDiff = currentTime - lastTimeRef.current;
      lastTimeRef.current = currentTime;

      if (e.key === 'Enter') {
        if (bufferRef.current.length >= 3) {
          onScan(bufferRef.current.trim());
          bufferRef.current = '';
          if (!isInput) {
            e.preventDefault();
          }
        }
        return;
      }

      // If time between keystrokes is too large (> 100ms) and we are not in an input, reset buffer
      if (timeDiff > 120 && !isInput) {
        bufferRef.current = '';
      }

      if (e.key.length === 1) {
        bufferRef.current += e.key;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onScan, enabled]);
}
