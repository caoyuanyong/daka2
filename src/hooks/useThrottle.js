import { useState, useCallback, useRef } from 'react';

export function useThrottle(callback, delay = 1000) {
  const [isCooldown, setIsCooldown] = useState(false);
  const cooldownTimer = useRef(null);

  const throttledCallback = useCallback((...args) => {
    if (isCooldown) return;

    callback(...args);
    setIsCooldown(true);

    if (cooldownTimer.current) clearTimeout(cooldownTimer.current);
    cooldownTimer.current = setTimeout(() => {
      setIsCooldown(false);
    }, delay);
  }, [callback, delay, isCooldown]);

  return [throttledCallback, isCooldown];
}
