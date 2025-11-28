import { Level } from './types';

interface GameDisplayProps {
  level: Level;
  scale: number;
}

export const GameDisplay = ({ level, scale }: GameDisplayProps) => {
  return (
    <div className="relative overflow-hidden rounded-lg border-4 border-border shadow-2xl">
      <div
        className="relative bg-game-bg"
        style={{
          width: level.width * scale,
          height: level.height * scale,
        }}
      >
        {/* Background grid */}
        <div className="absolute inset-0">
          {level.grid.map((row, y) => (
            <div key={y} className="flex" style={{ height: scale }}>
              {row.map((type, x) => (
                <div
                  key={x}
                  className={
                    type === 'wall'
                      ? 'bg-game-wall border-2 border-game-wall-border'
                      : type === 'lava'
                      ? 'bg-game-lava'
                      : 'bg-transparent'
                  }
                  style={{ width: scale, height: scale }}
                />
              ))}
            </div>
          ))}
        </div>

        {/* Actors */}
        <div className="absolute inset-0">
          {level.actors.map((actor, i) => {
            const isPlayer = actor.type === 'player';
            const isCoin = actor.type === 'coin';
            const isLava = actor.type === 'lava';

            let bgClass = '';
            if (isPlayer) {
              if (level.status === 'lost') bgClass = 'bg-game-player-lost';
              else if (level.status === 'won') bgClass = 'bg-game-player-won';
              else bgClass = 'bg-game-player shadow-lg shadow-primary/50';
            } else if (isCoin) {
              bgClass = 'bg-game-coin rounded-full shadow-lg shadow-accent/50';
            } else if (isLava) {
              bgClass = 'bg-game-lava';
            }

            return (
              <div
                key={`${actor.type}-${i}`}
                className={`absolute ${bgClass}`}
                style={{
                  width: actor.size.x * scale,
                  height: actor.size.y * scale,
                  transform: `translate(${actor.pos.x * scale}px, ${actor.pos.y * scale}px)`,
                  willChange: 'transform',
                }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};
