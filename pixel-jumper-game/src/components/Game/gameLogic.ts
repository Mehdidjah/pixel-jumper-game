import { Vector, Actor, Level, Keys, LevelPlan } from './types';

export function createVector(x: number, y: number): Vector {
  return { x, y };
}

export function vectorPlus(v1: Vector, v2: Vector): Vector {
  return { x: v1.x + v2.x, y: v1.y + v2.y };
}

export function vectorTimes(v: Vector, scale: number): Vector {
  return { x: v.x * scale, y: v.y * scale };
}

const playerXSpeed = 10;
const gravity = 30;
const jumpSpeed = 17;
const wobbleSpeed = 8;
const wobbleDist = 0.07;
const maxStep = 0.05;

export function createPlayer(pos: Vector): Actor {
  return {
    pos: vectorPlus(pos, createVector(0, -0.5)),
    size: createVector(0.5, 1),
    type: 'player',
    speed: createVector(0, 0),
    act: function (step: number, level: Level, keys: Keys) {
      playerMoveX.call(this, step, level, keys);
      playerMoveY.call(this, step, level, keys);

      const otherActor = level.actorAt(this);
      if (otherActor) level.playerTouched(otherActor.type, otherActor);

      if (level.status === 'lost') {
        this.pos.y += step;
        this.size.y -= step;
      }
    },
  };
}

function playerMoveX(this: Actor, step: number, level: Level, keys: Keys) {
  this.speed!.x = 0;
  if (keys.left) this.speed!.x -= playerXSpeed;
  if (keys.right) this.speed!.x += playerXSpeed;

  const motion = createVector(this.speed!.x * step, 0);
  const newPos = vectorPlus(this.pos, motion);
  const obstacle = level.obstacleAt(newPos, this.size);
  if (obstacle) level.playerTouched(obstacle);
  else this.pos = newPos;
}

function playerMoveY(this: Actor, step: number, level: Level, keys: Keys) {
  this.speed!.y += step * gravity;
  const motion = createVector(0, this.speed!.y * step);
  const newPos = vectorPlus(this.pos, motion);
  const obstacle = level.obstacleAt(newPos, this.size);
  if (obstacle) {
    level.playerTouched(obstacle);
    if (keys.up && this.speed!.y > 0) this.speed!.y = -jumpSpeed;
    else this.speed!.y = 0;
  } else {
    this.pos = newPos;
  }
}

export function createLava(pos: Vector, ch: string): Actor {
  const lava: Actor = {
    pos,
    size: createVector(1, 1),
    type: 'lava',
    act: function (step: number, level: Level) {
      const newPos = vectorPlus(this.pos, vectorTimes(this.speed!, step));
      if (!level.obstacleAt(newPos, this.size)) this.pos = newPos;
      else if (this.repeatPos) this.pos = this.repeatPos;
      else this.speed = vectorTimes(this.speed!, -1);
    },
  };

  if (ch === '=') lava.speed = createVector(2, 0);
  else if (ch === '|') lava.speed = createVector(0, 2);
  else if (ch === 'v') {
    lava.speed = createVector(0, 3);
    lava.repeatPos = pos;
  }

  return lava;
}

export function createCoin(pos: Vector): Actor {
  return {
    basePos: pos,
    pos,
    size: createVector(0.6, 0.6),
    type: 'coin',
    wobble: Math.random() * Math.PI * 2,
    act: function (step: number) {
      this.wobble! += step * wobbleSpeed;
      const wobblePos = Math.sin(this.wobble!) * wobbleDist;
      this.pos = vectorPlus(this.basePos!, createVector(0, wobblePos));
    },
  };
}

const actorChars: { [key: string]: (pos: Vector, ch: string) => Actor } = {
  '@': (pos) => createPlayer(pos),
  'o': (pos) => createCoin(pos),
  '=': (pos, ch) => createLava(pos, ch),
  '|': (pos, ch) => createLava(pos, ch),
  'v': (pos, ch) => createLava(pos, ch),
};

export function createLevel(plan: LevelPlan): Level {
  const width = plan[0].length;
  const height = plan.length;
  const grid: (string | null)[][] = [];
  const actors: Actor[] = [];

  for (let y = 0; y < height; y++) {
    const line = plan[y];
    const gridLine: (string | null)[] = [];
    for (let x = 0; x < width; x++) {
      const ch = line[x];
      let fieldType: string | null = null;
      const Actor = actorChars[ch];
      if (Actor) actors.push(Actor(createVector(x, y), ch));
      else if (ch === 'x') fieldType = 'wall';
      else if (ch === '!') fieldType = 'lava';
      gridLine.push(fieldType);
    }
    grid.push(gridLine);
  }

  const player = actors.find((actor) => actor.type === 'player')!;

  const level: Level = {
    width,
    height,
    grid,
    actors,
    player,
    status: null,
    finishDelay: 0,
    obstacleAt(pos: Vector, size: Vector): string | null {
      const xStart = Math.floor(pos.x);
      const xEnd = Math.ceil(pos.x + size.x);
      const yStart = Math.floor(pos.y);
      const yEnd = Math.ceil(pos.y + size.y);

      if (xStart < 0 || xEnd > this.width || yStart < 0) return 'wall';
      if (yEnd > this.height) return 'lava';
      for (let y = yStart; y < yEnd; y++) {
        for (let x = xStart; x < xEnd; x++) {
          const fieldType = this.grid[y][x];
          if (fieldType) return fieldType;
        }
      }
      return null;
    },
    actorAt(actor: Actor): Actor | null {
      for (let i = 0; i < this.actors.length; i++) {
        const other = this.actors[i];
        if (
          other !== actor &&
          actor.pos.x + actor.size.x > other.pos.x &&
          actor.pos.x < other.pos.x + other.size.x &&
          actor.pos.y + actor.size.y > other.pos.y &&
          actor.pos.y < other.pos.y + other.size.y
        )
          return other;
      }
      return null;
    },
    animate(step: number, keys: Keys) {
      if (this.status != null) this.finishDelay -= step;

      while (step > 0) {
        const thisStep = Math.min(step, maxStep);
        this.actors.forEach((actor) => {
          actor.act(thisStep, this, keys);
        });
        step -= thisStep;
      }
    },
    playerTouched(type: string, actor?: Actor) {
      if (type === 'lava' && this.status == null) {
        this.status = 'lost';
        this.finishDelay = 1;
      } else if (type === 'coin' && actor) {
        this.actors = this.actors.filter((other) => other !== actor);
        if (!this.actors.some((actor) => actor.type === 'coin')) {
          this.status = 'won';
          this.finishDelay = 1;
        }
      }
    },
    isFinished() {
      return this.status != null && this.finishDelay < 0;
    },
  };

  return level;
}
