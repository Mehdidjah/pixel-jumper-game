import { useEffect, useRef, useState } from 'react';
import { Level, Keys } from './types';

export function useGameLoop(
  level: Level | null,
  keys: Keys,
  onLevelFinish: (status: string) => void
) {
  const animationFrameRef = useRef<number>();
  const lastTimeRef = useRef<number | null>(null);
  const [, setTick] = useState(0);

  useEffect(() => {
    if (!level) return;

    lastTimeRef.current = null;

    const frame = (time: number) => {
      if (lastTimeRef.current !== null) {
        const timeStep = Math.min(time - lastTimeRef.current, 100) / 1000;
        level.animate(timeStep, keys);

        // Force re-render for smooth animation
        setTick(tick => tick + 1);

        if (level.isFinished()) {
          onLevelFinish(level.status!);
          return;
        }
      }
      lastTimeRef.current = time;
      animationFrameRef.current = requestAnimationFrame(frame);
    };

    animationFrameRef.current = requestAnimationFrame(frame);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [level, keys, onLevelFinish]);
}
