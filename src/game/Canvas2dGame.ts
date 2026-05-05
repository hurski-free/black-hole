import { random } from "./math";
import { BlackHole } from "./objects/class/BlackHole";
import { ObjectPool } from "./objects/class/ObjectPool";
import { Particle } from "./objects/class/Particle";
import { Star } from "./objects/class/Star";
import { BLACK_HOLE_GRAVITY_COEFFICIENT, BLACK_HOLE_POOL_CAPACITY, FIRST_BLACK_HOLE_TIME_REMAINS, INITIAL_BLACK_HOLE_RADIUS, NEXT_BLACK_HOLE_TIME_REMAINS, PARTICLE_POOL_CAPACITY, STAR_POOL_CAPACITY } from "./objects/const";

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

  private _blackHoleTimeRemains: number = 0;
  private _prevTimestamp: DOMHighResTimeStamp = 0;

  private _width: number = 0;
  private _height: number = 0;

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

  get width() {
    return this._width;
  }

  get height() {
    return this._height;
  }

  get blackHoleTimeRemains() {
    return this._blackHoleTimeRemains;
  }

  get gameState() {
    return this._gameState;
  }

  start() {
    console.log('start', this._gameState);
    if (this._gameState === 'wait_for_start') {
      this._gameState = 'running';
  
      const star1 = this.stars.getObject();
      const star2 = this.stars.getObject();

      star1.x = 200;
      star1.y = 200;
      star1.velocityX = 0;
      star1.velocityY = 0;
      star1.accelerationX = 0;
      star1.accelerationY = 0;
      star1.radius = 70;

      star2.x = 100;
      star2.y = 500;
      star2.velocityX = 0;
      star2.velocityY = 0;
      star2.accelerationX = 0;
      star2.accelerationY = 0;
      star2.radius = 40;
      
      // const blackHole = this.blackHoles.getObject();
      // blackHole.x = 500;
      // blackHole.y = 500;
      // blackHole.radius = 20;

      this._blackHoleTimeRemains = FIRST_BLACK_HOLE_TIME_REMAINS * 10000;
      // this._blackHoleTimeRemains = FIRST_BLACK_HOLE_TIME_REMAINS;

      this.tick(performance.now());
    }
  }

  tick(now: DOMHighResTimeStamp) {
    if (this._gameState === 'running') {
      const deltaTime = now - this._prevTimestamp;
      this._prevTimestamp = now;

      if (deltaTime > 200) {
        // ignore cycle
        this.animationFrameId = requestAnimationFrame((now) => this.tick(now));
      } else {
        this._blackHoleTimeRemains -= deltaTime; // 16ms

        if (this._blackHoleTimeRemains <= 0) {
          const blackHole = this.blackHoles.getObject();
          blackHole.x = random(0, this._width);
          blackHole.y = random(0, this._height);
          blackHole.radius = INITIAL_BLACK_HOLE_RADIUS;

          this._blackHoleTimeRemains = NEXT_BLACK_HOLE_TIME_REMAINS;
        }
  
        this.engineFunction();
        this.renderFunction();
        this.animationFrameId = requestAnimationFrame((now) => this.tick(now));
      }
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
      this.tick(performance.now());
    }
  }

  stop() {
    if (this._gameState !== 'wait_for_start') {
      this._gameState = 'wait_for_start';
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = 0;
      this.clearObjects();
      this.renderFunction();
    }
  }

  restart() {
    this.stop();
    this.start();
  }

  resizeCanvas(width: number, height: number) {
    this._width = width;
    this._height = height;
  }

  private clearObjects() {
    this.blackHoles.clear();
    this.stars.clear();
    this.particles.clear();
  }
}
