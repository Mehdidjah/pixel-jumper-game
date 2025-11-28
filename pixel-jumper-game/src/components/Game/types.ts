export interface Vector {
  x: number;
  y: number;
}

export interface Actor {
  pos: Vector;
  size: Vector;
  type: string;
  speed?: Vector;
  wobble?: number;
  basePos?: Vector;
  repeatPos?: Vector;
  act: (step: number, level: Level, keys: Keys) => void;
}

export interface Keys {
  left: boolean;
  right: boolean;
  up: boolean;
}

export interface Level {
  width: number;
  height: number;
  grid: (string | null)[][];
  actors: Actor[];
  player: Actor;
  status: string | null;
  finishDelay: number;
  obstacleAt: (pos: Vector, size: Vector) => string | null;
  actorAt: (actor: Actor) => Actor | null;
  animate: (step: number, keys: Keys) => void;
  playerTouched: (type: string, actor?: Actor) => void;
  isFinished: () => boolean;
}

export type LevelPlan = string[];
