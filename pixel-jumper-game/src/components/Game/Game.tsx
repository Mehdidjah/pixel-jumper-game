import { useState, useEffect, useCallback } from 'react';
import { createLevel } from './gameLogic';
import { GameDisplay } from './GameDisplay';
import { useKeyboard } from './useKeyboard';
import { useGameLoop } from './useGameLoop';
import { Level } from './types';
import { LEVELS } from './levels';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Trophy, RotateCcw, Play } from 'lucide-react';

const SCALE = 15;

export const Game = () => {
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [level, setLevel] = useState<Level | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [totalCoins, setTotalCoins] = useState(0);
  const keys = useKeyboard();

  const startLevel = useCallback((levelIndex: number) => {
    const newLevel = createLevel(LEVELS[levelIndex]);
    const coins = newLevel.actors.filter((actor) => actor.type === 'coin').length;
    setTotalCoins(coins);
    setLevel(newLevel);
    setGameStarted(true);
  }, []);

  const handleLevelFinish = useCallback(
    (status: string) => {
      if (status === 'lost') {
        setTimeout(() => startLevel(currentLevelIndex), 500);
      } else if (status === 'won') {
        if (currentLevelIndex < LEVELS.length - 1) {
          setTimeout(() => {
            setCurrentLevelIndex(currentLevelIndex + 1);
            startLevel(currentLevelIndex + 1);
          }, 1000);
        } else {
          setGameStarted(false);
        }
      }
    },
    [currentLevelIndex, startLevel]
  );

  useGameLoop(level, keys, handleLevelFinish);

  useEffect(() => {
    if (gameStarted && currentLevelIndex === 0 && !level) {
      startLevel(0);
    }
  }, [gameStarted, currentLevelIndex, level, startLevel]);

  const restartLevel = () => {
    startLevel(currentLevelIndex);
  };

  const restartGame = () => {
    setCurrentLevelIndex(0);
    setGameStarted(false);
    setLevel(null);
  };

  if (!gameStarted) {
    const gameCompleted = currentLevelIndex >= LEVELS.length - 1 && level?.status === 'won';

    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full p-8 text-center space-y-6 bg-card/80 backdrop-blur">
          {gameCompleted ? (
            <>
              <Trophy className="w-24 h-24 mx-auto text-accent animate-bounce" />
              <h1 className="text-5xl font-bold text-foreground">You Win!</h1>
              <p className="text-xl text-muted-foreground">
                Congratulations! You've completed all 7 levels!
              </p>
              <Button onClick={restartGame} size="lg" className="text-lg">
                <Play className="mr-2 h-5 w-5" />
                Play Again
              </Button>
            </>
          ) : (
            <>
              <h1 className="text-5xl font-bold text-foreground">Platform Adventure</h1>
              <p className="text-xl text-muted-foreground">
                Navigate through 7 challenging levels, collect all coins, and avoid the lava!
              </p>
              <div className="space-y-4 text-left bg-muted/50 p-6 rounded-lg">
                <h2 className="text-2xl font-semibold text-foreground">How to Play:</h2>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <span className="text-primary font-bold">←→</span> Move left and right
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-primary font-bold">↑</span> Jump (press while on ground)
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-4 h-4 bg-game-coin rounded-full inline-block"></span> Collect all coins
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-4 h-4 bg-game-lava inline-block"></span> Avoid the lava!
                  </li>
                </ul>
              </div>
              <Button onClick={() => setGameStarted(true)} size="lg" className="text-lg">
                <Play className="mr-2 h-5 w-5" />
                Start Game
              </Button>
            </>
          )}
        </Card>
      </div>
    );
  }

  if (!level) return null;

  const coinsCollected = totalCoins - level.actors.filter((actor) => actor.type === 'coin').length;

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Header */}
        <Card className="p-4 bg-card/80 backdrop-blur">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-bold text-foreground">
                Level {currentLevelIndex + 1} / {LEVELS.length}
              </h2>
              <div className="flex items-center gap-2 text-lg">
                <span className="w-5 h-5 bg-game-coin rounded-full inline-block"></span>
                <span className="font-semibold text-accent">
                  {coinsCollected} / {totalCoins}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={restartLevel} variant="outline" size="sm">
                <RotateCcw className="mr-2 h-4 w-4" />
                Restart Level
              </Button>
              <Button onClick={restartGame} variant="outline" size="sm">
                Menu
              </Button>
            </div>
          </div>
        </Card>

        {/* Game Display */}
        <div className="flex justify-center">
          <GameDisplay level={level} scale={SCALE} />
        </div>

        {/* Controls Info */}
        <Card className="p-4 bg-card/80 backdrop-blur">
          <div className="flex justify-center gap-8 text-sm text-muted-foreground">
            <span>← → Move</span>
            <span>↑ Jump</span>
          </div>
        </Card>

        {/* Status Messages */}
        {level.status === 'lost' && (
          <div className="text-center">
            <p className="text-2xl font-bold text-destructive animate-pulse">
              Try Again!
            </p>
          </div>
        )}
        {level.status === 'won' && (
          <div className="text-center">
            <p className="text-2xl font-bold text-accent animate-bounce">
              Level Complete! 🎉
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
