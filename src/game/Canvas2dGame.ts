import { BlackHole } from "./objects/class/BlackHole";
import { ObjectPool } from "./objects/class/ObjectPool";
import { Particle } from "./objects/class/Particle";
import { Star } from "./objects/class/Star";
import { BLACK_HOLE_POOL_CAPACITY, PARTICLE_POOL_CAPACITY, STAR_POOL_CAPACITY } from "./objects/const";

type GameBindedFunction = (this: Canvas2dGame) => void;

interface IGameConfig {
  ctx: CanvasRenderingContext2D;
  engineFunction: GameBindedFunction;
  renderFunction: GameBindedFunction;
}

type GameState = 'wait_for_start' | 'running' | 'paused';

/**
 * non-optimized game class
 */
export class Canvas2dGame {
  private _ctx: CanvasRenderingContext2D;
  private engineFunction: GameBindedFunction;
  private renderFunction: GameBindedFunction;

  private _blackHoles: ObjectPool<BlackHole>;
  private _stars: ObjectPool<Star>;
  private _particles: ObjectPool<Particle>;

  private animationFrameId: number = 0;
  private _gameState: GameState = 'wait_for_start';

  constructor(cfg: IGameConfig) {
    if (!(cfg.ctx instanceof CanvasRenderingContext2D)) {
      throw new Error('ctx must be a CanvasRenderingContext2D');
    }

    this._ctx = cfg.ctx;

    this.engineFunction = cfg.engineFunction.bind(this);
    this.renderFunction = cfg.renderFunction.bind(this);

    this._blackHoles = new ObjectPool<BlackHole>(BLACK_HOLE_POOL_CAPACITY, () => new BlackHole());
    this._stars = new ObjectPool<Star>(STAR_POOL_CAPACITY, () => new Star());
    this._particles = new ObjectPool<Particle>(PARTICLE_POOL_CAPACITY, () => new Particle());
  }

  get ctx() {
    return this._ctx;
  }

  get blackHoles() {
    return this._blackHoles;
  }

  get stars() {
    return this._stars;
  }

  get particles() {
    return this._particles;
  }

  start() {
    console.log('start', this._gameState);
    if (this._gameState === 'wait_for_start') {
      this._gameState = 'running';
  
      const star1 = this.stars.getObject();
      const star2 = this.stars.getObject();
      const star3 = this.stars.getObject();

      star1.x = 200;
      star1.y = 200;
      star1.radius = 70;
      star1.mass = 70;

      star2.x = 400;
      star2.y = 400;
      star2.radius = 40;
      star2.mass = 40;

      star3.x = 400;
      star3.y = 300;
      star3.radius = 20;
      star3.mass = 20;

      this.tick();
    }
  }

  tick() {
    if (this._gameState === 'running') {
      this.engineFunction();
      this.renderFunction();
      this.animationFrameId = requestAnimationFrame(() => this.tick());
    }
  }

  pause() {
    if (this._gameState === 'running') {
      this._gameState = 'paused';
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = 0;
    }
  }

  resume() {
    if (this._gameState === 'paused') {
      this._gameState = 'running';
      this.tick();
    }
  }

  stop() {
    if (this._gameState !== 'wait_for_start') {
      this._gameState = 'wait_for_start';
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = 0;
    }
  }

  restart() {
    this.stop();
    this.start();
  }
}
