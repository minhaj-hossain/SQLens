import { useEffect, type RefObject } from 'react';

/**
 * useCloseOnOutside
 * -----------------------------------------------------------------------------
 * Closes a modal/drawer when the user clicks (or touches) anywhere outside the
 * referenced panel. Uses a native document-level listener so it works reliably
 * regardless of z-index / stacking contexts / event propagation quirks.
 *
 * @param ref     Ref to the modal panel element (clicks INSIDE are ignored).
 * @param isOpen  Whether the modal is currently open.
 * @param onClose Callback invoked when a click/tap lands outside the panel.
 */
export function useCloseOnOutside<T extends HTMLElement>(
  ref: RefObject<T | null>,
  isOpen: boolean,
  onClose: () => void
): void {
  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node | null;
      if (ref.current && target && !ref.current.contains(target)) {
        onClose();
      }
    };

    // mousedown/touchstart fire before click and before any focus changes,
    // making this the most reliable "click outside" signal.
    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('touchstart', handlePointerDown, { passive: true });

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
    };
  }, [isOpen, onClose, ref]);
}
