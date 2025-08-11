import { useCallback, useRef, useState } from 'react';

interface GestureOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onLongPress?: () => void;
  onTap?: () => void;
  onDoubleTap?: () => void;
  onPinchIn?: () => void;
  onPinchOut?: () => void;
  longPressDelay?: number;
  swipeThreshold?: number;
  doubleTapDelay?: number;
  enableHaptic?: boolean;
}

interface TouchPoint {
  x: number;
  y: number;
  timestamp: number;
}

interface GestureState {
  isLongPressing: boolean;
  isSwiping: boolean;
  startPoint: TouchPoint | null;
  currentPoint: TouchPoint | null;
  longPressTimer: NodeJS.Timeout | null;
  lastTapTime: number;
  tapCount: number;
}

export const useMobileGestures = (options: GestureOptions = {}) => {
  const {
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    onLongPress,
    onTap,
    onDoubleTap,
    onPinchIn,
    onPinchOut,
    longPressDelay = 500,
    swipeThreshold = 50,
    doubleTapDelay = 300,
    enableHaptic = true
  } = options;

  const [gestureState, setGestureState] = useState<GestureState>({
    isLongPressing: false,
    isSwiping: false,
    startPoint: null,
    currentPoint: null,
    longPressTimer: null,
    lastTapTime: 0,
    tapCount: 0
  });

  const gestureRef = useRef<GestureState>(gestureState);
  gestureRef.current = gestureState;

  // Haptic feedback function
  const triggerHaptic = useCallback((type: 'light' | 'medium' | 'heavy' = 'light') => {
    if (!enableHaptic || !navigator.vibrate) return;
    
    const patterns = {
      light: [10],
      medium: [20],
      heavy: [30]
    };
    
    navigator.vibrate(patterns[type]);
  }, [enableHaptic]);

  // Calculate distance between two points
  const getDistance = useCallback((point1: TouchPoint, point2: TouchPoint) => {
    const dx = point2.x - point1.x;
    const dy = point2.y - point1.y;
    return Math.sqrt(dx * dx + dy * dy);
  }, []);

  // Calculate angle between two points
  const getAngle = useCallback((point1: TouchPoint, point2: TouchPoint) => {
    const dx = point2.x - point1.x;
    const dy = point2.y - point1.y;
    return Math.atan2(dy, dx) * 180 / Math.PI;
  }, []);

  // Handle touch start
  const handleTouchStart = useCallback((event: React.TouchEvent | TouchEvent) => {
    const touch = event.touches[0];
    const point: TouchPoint = {
      x: touch.clientX,
      y: touch.clientY,
      timestamp: Date.now()
    };

    setGestureState(prev => ({
      ...prev,
      startPoint: point,
      currentPoint: point,
      isSwiping: false,
      isLongPressing: false
    }));

    // Start long press timer
    const timer = setTimeout(() => {
      if (onLongPress) {
        setGestureState(prev => ({ ...prev, isLongPressing: true }));
        onLongPress();
        triggerHaptic('medium');
      }
    }, longPressDelay);

    setGestureState(prev => ({ ...prev, longPressTimer: timer }));
  }, [onLongPress, longPressDelay, triggerHaptic]);

  // Handle touch move
  const handleTouchMove = useCallback((event: React.TouchEvent | TouchEvent) => {
    const touch = event.touches[0];
    const point: TouchPoint = {
      x: touch.clientX,
      y: touch.clientY,
      timestamp: Date.now()
    };

    setGestureState(prev => ({ ...prev, currentPoint: point }));

    // Clear long press timer if moving
    if (gestureRef.current.longPressTimer) {
      clearTimeout(gestureRef.current.longPressTimer);
      setGestureState(prev => ({ ...prev, longPressTimer: null }));
    }

    // Check if swiping
    if (gestureRef.current.startPoint) {
      const distance = getDistance(gestureRef.current.startPoint, point);
      if (distance > 10) {
        setGestureState(prev => ({ ...prev, isSwiping: true }));
      }
    }
  }, [getDistance]);

  // Handle touch end
  const handleTouchEnd = useCallback((event: React.TouchEvent | TouchEvent) => {
    const currentTime = Date.now();
    const { startPoint, currentPoint, isLongPressing, isSwiping } = gestureRef.current;

    // Clear long press timer
    if (gestureRef.current.longPressTimer) {
      clearTimeout(gestureRef.current.longPressTimer);
    }

    // Handle swipe gestures
    if (startPoint && currentPoint && isSwiping) {
      const distance = getDistance(startPoint, currentPoint);
      const angle = getAngle(startPoint, currentPoint);

      if (distance > swipeThreshold) {
        // Determine swipe direction
        if (Math.abs(angle) < 45) {
          // Horizontal swipe
          if (angle > 0 && onSwipeRight) {
            onSwipeRight();
            triggerHaptic('light');
          } else if (angle < 0 && onSwipeLeft) {
            onSwipeLeft();
            triggerHaptic('light');
          }
        } else {
          // Vertical swipe
          if (angle > 45 && angle < 135 && onSwipeDown) {
            onSwipeDown();
            triggerHaptic('light');
          } else if ((angle > -135 && angle < -45) && onSwipeUp) {
            onSwipeUp();
            triggerHaptic('light');
          }
        }
      }
    }

    // Handle tap gestures
    if (!isLongPressing && !isSwiping && startPoint && currentPoint) {
      const distance = getDistance(startPoint, currentPoint);
      if (distance < 10) {
        const timeSinceLastTap = currentTime - gestureRef.current.lastTapTime;
        
        if (timeSinceLastTap < doubleTapDelay) {
          // Double tap
          if (onDoubleTap) {
            onDoubleTap();
            triggerHaptic('medium');
          }
          setGestureState(prev => ({ ...prev, tapCount: 0, lastTapTime: 0 }));
        } else {
          // Single tap
          if (onTap) {
            onTap();
            triggerHaptic('light');
          }
          setGestureState(prev => ({ 
            ...prev, 
            tapCount: prev.tapCount + 1, 
            lastTapTime: currentTime 
          }));
        }
      }
    }

    // Reset state
    setGestureState(prev => ({
      ...prev,
      startPoint: null,
      currentPoint: null,
      isSwiping: false,
      isLongPressing: false,
      longPressTimer: null
    }));
  }, [
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    onTap,
    onDoubleTap,
    swipeThreshold,
    doubleTapDelay,
    getDistance,
    getAngle,
    triggerHaptic
  ]);

  // Handle pinch gestures (for multi-touch)
  const handlePinch = useCallback((event: React.TouchEvent | TouchEvent) => {
    if (event.touches.length === 2) {
      const touch1 = event.touches[0];
      const touch2 = event.touches[1];
      
      const distance = getDistance(
        { x: touch1.clientX, y: touch1.clientY, timestamp: Date.now() },
        { x: touch2.clientX, y: touch2.clientY, timestamp: Date.now() }
      );

      // Store initial pinch distance for comparison
      if (!gestureRef.current.startPoint) {
        setGestureState(prev => ({
          ...prev,
          startPoint: { x: distance, y: 0, timestamp: Date.now() }
        }));
      } else {
        const initialDistance = gestureRef.current.startPoint.x;
        const scale = distance / initialDistance;
        
        if (scale < 0.8 && onPinchIn) {
          onPinchIn();
          triggerHaptic('light');
        } else if (scale > 1.2 && onPinchOut) {
          onPinchOut();
          triggerHaptic('light');
        }
      }
    }
  }, [onPinchIn, onPinchOut, getDistance, triggerHaptic]);

  // Combined touch handler
  const handleTouch = useCallback((event: React.TouchEvent | TouchEvent) => {
    switch (event.type) {
      case 'touchstart':
        handleTouchStart(event);
        break;
      case 'touchmove':
        handleTouchMove(event);
        handlePinch(event);
        break;
      case 'touchend':
        handleTouchEnd(event);
        break;
    }
  }, [handleTouchStart, handleTouchMove, handleTouchEnd, handlePinch]);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (gestureRef.current.longPressTimer) {
      clearTimeout(gestureRef.current.longPressTimer);
    }
    setGestureState({
      isLongPressing: false,
      isSwiping: false,
      startPoint: null,
      currentPoint: null,
      longPressTimer: null,
      lastTapTime: 0,
      tapCount: 0
    });
  }, []);

  return {
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleTouch,
    handlePinch,
    cleanup,
    isLongPressing: gestureState.isLongPressing,
    isSwiping: gestureState.isSwiping,
    triggerHaptic
  };
};
