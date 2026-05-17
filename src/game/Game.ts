import type { IEngine } from "./engine/IEngine";
import { type IVec2 } from "./math";
import type { IObjectPool } from "./objects/class/IObjectPool";
import type { IRender } from "./render/IRender";

export type GameState = 'wait_for_start' | 'running' | 'paused';

interface IGameConfig<BH, S, P> {
  engine: IEngine<BH, S, P>;
  renderer: IRender<BH, S, P>;

  blackHoles: IObjectPool<BH>;
  stars: IObjectPool<S>;
  particles: IObjectPool<P>;
}

/**
 * non-optimized game class
 * For SoA just use number for indexes
 */
export abstract class Game<BH, S, P> {
  protected engine: IEngine<BH, S, P>;
  protected renderer: IRender<BH, S, P>;

  // must be initialized in children classes
  protected _blackHoles: IObjectPool<BH>;
  protected _stars: IObjectPool<S>;
  protected _particles: IObjectPool<P>;

  /**
   * Stats field, must be updatable from engine and readable from renderer
   */
  public score: number = 0;
  /**
   * Stats field, must be updatable from engine and readable from renderer
   */
  public particlesAbsorbedByBlackHoles: number = 0;

  protected animationFrameId: number = 0;
  protected _gameState: GameState = 'wait_for_start';

  protected _blackHoleTimeRemains: number = 0;
  protected _prevTimestamp: DOMHighResTimeStamp = 0;

  protected _width: number = 0;
  protected _height: number = 0;

  protected _halfWidth: number = 0;
  protected _halfHeight: number = 0;

  protected _camera: IVec2 = { x: 0, y: 0 };

  constructor(cfg: IGameConfig<BH, S, P>) {
    this.engine = cfg.engine;
    this.renderer = cfg.renderer;

    this._blackHoles = cfg.blackHoles;
    this._stars = cfg.stars;
    this._particles = cfg.particles;
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

  get halfWidth() {
    return this._halfWidth;
  }

  get halfHeight() {
    return this._halfHeight;
  }

  get blackHoleTimeRemains() {
    return this._blackHoleTimeRemains;
  }

  get gameState() {
    return this._gameState;
  }

  get camera() {
    return this._camera;
  }

  start() {
    if (this._gameState === 'wait_for_start') {
      this._gameState = 'running';

      this._camera.x = -this.halfWidth;
      this._camera.y = -this.halfHeight;  

      this.initStartData();

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
        if (this._blackHoleTimeRemains <= 0) {
          this.tryBlackHoleAppear();
        }

        this._blackHoleTimeRemains -= deltaTime;
  
        this.engine.process(this);
        this.renderer.render(this);
        this.animationFrameId = requestAnimationFrame((now) => this.tick(now));
      }
    }
  }

  /**
   * Initialize objects specific for game mode
   */
  protected abstract initStartData(): void;

  /**
   * Try to appear black hole specific for game mode
   */
  protected abstract tryBlackHoleAppear(): void;

  /**
   * Modify position to world and search star under mouse
   * 
   * If star found, increase its radius
   */
  public abstract hoverStar(mouseX: number, mouseY: number): void;

  /**
   * Move camera to star
   */
  public abstract moveToStar(): void;

  /**
   * Move camera to black hole
   */
  public abstract moveToBlackHole(): void;

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
      this.renderer.render(this);
    }
  }

  restart() {
    this.stop();
    this.start();
  }

  resizeCanvas(width: number, height: number, cameraSet = false) {
    this._width = width;
    this._height = height;
    this._halfWidth = width / 2;
    this._halfHeight = height / 2;

    if (cameraSet) {
      this._camera.x = -this._halfWidth;
      this._camera.y = -this._halfHeight;  
    }
  }

  cameraMove(deltaX: number, deltaY: number) {
    this._camera.x -= deltaX;
    this._camera.y -= deltaY;

    if (this.gameState === 'paused') {
      this.renderer.render(this);
    }
  }

  private clearObjects() {
    this.blackHoles.clear();
    this.stars.clear();
    this.particles.clear();
  }
}
