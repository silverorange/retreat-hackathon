import { useEffect, useRef } from 'react';

export function useAnimationFrame(
  callback: (delta: number) => void,
  dependencies?: any[]
) {
  const frame = useRef<number>();
  const last = useRef<number>(0);

  function animate(time: number) {
    // I'm not sure how this occurs but it is a bug. It's likely an incorrect
    // hook dependency that causes multiple animation frames to be registered
    // at the same time.
    if (time - last.current === 0) {
      console.error('got a 0 length animation frame');
      return;
    }

    if (last.current > 0) {
      const delta = (time - last.current) / 1000;
      callback(delta);
    }
    last.current = time;
    frame.current = requestAnimationFrame(animate);
  }

  useEffect(() => {
    frame.current = requestAnimationFrame(animate);

    return () => {
      if (frame.current !== undefined) {
        cancelAnimationFrame(frame.current);
      }
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);
}
