import { useEffect, useState } from 'react';
import { Keys } from './types';

const arrowCodes: { [key: number]: keyof Keys } = {
  37: 'left',
  38: 'up',
  39: 'right',
};

export function useKeyboard(): Keys {
  const [keys, setKeys] = useState<Keys>({
    left: false,
    right: false,
    up: false,
  });

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = arrowCodes[event.keyCode];
      if (key) {
        event.preventDefault();
        setKeys((prev) => ({ ...prev, [key]: true }));
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      const key = arrowCodes[event.keyCode];
      if (key) {
        event.preventDefault();
        setKeys((prev) => ({ ...prev, [key]: false }));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return keys;
}
