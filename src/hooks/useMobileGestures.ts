import { useCallback } from 'react';
import { useMobile } from './useMobile';

interface GestureCallbacks {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onLongPress?: () => void;
  onTap?: () => void;
}

export const useMobileGestures = (callbacks: GestureCallbacks) => {
  const { isMobile, triggerHaptic } = useMobile();

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (!isMobile) return;

    const touch = e.touches[0];
    const startX = touch.clientX;
    const startY = touch.clientY;
    const startTime = Date.now();

    const handleTouchEnd = (e: TouchEvent) => {
      if (!isMobile) return;

      const touch = e.changedTouches[0];
      const endX = touch.clientX;
      const endY = touch.clientY;
      const endTime = Date.now();

      const deltaX = endX - startX;
      const deltaY = endY - startY;
      const deltaTime = endTime - startTime;

      // Swipe detection
      if (Math.abs(deltaX) > 50 && Math.abs(deltaY) < 50) {
        if (deltaX > 0 && callbacks.onSwipeRight) {
          callbacks.onSwipeRight();
          triggerHaptic();
        } else if (deltaX < 0 && callbacks.onSwipeLeft) {
          callbacks.onSwipeLeft();
          triggerHaptic();
        }
      }

      // Long press detection
      if (deltaTime > 500 && Math.abs(deltaX) < 10 && Math.abs(deltaY) < 10) {
        if (callbacks.onLongPress) {
          callbacks.onLongPress();
          triggerHaptic();
        }
      }

      // Tap detection
      if (deltaTime < 200 && Math.abs(deltaX) < 10 && Math.abs(deltaY) < 10) {
        if (callbacks.onTap) {
          callbacks.onTap();
        }
      }

      document.removeEventListener('touchend', handleTouchEnd);
    };

    document.addEventListener('touchend', handleTouchEnd);
  }, [isMobile, callbacks, triggerHaptic]);

  return {
    handleTouchStart,
    isMobile
  };
};
