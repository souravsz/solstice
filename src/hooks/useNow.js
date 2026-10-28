import { useEffect, useState } from 'react';

/**
 * The current time, refreshed every `intervalMs` (30 s by default).
 * Ticks are aligned to the wall clock (:00 and :30) so minute changes show promptly,
 * and the time refreshes immediately when the tab becomes visible again.
 */
export function useNow(intervalMs = 30000) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    let intervalId;
    const tick = () => setNow(new Date());
    const timeoutId = window.setTimeout(() => {
      tick();
      intervalId = window.setInterval(tick, intervalMs);
    }, intervalMs - (Date.now() % intervalMs));

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') tick();
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      window.clearTimeout(timeoutId);
      window.clearInterval(intervalId);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [intervalMs]);

  return now;
}
