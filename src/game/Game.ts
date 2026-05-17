import type { IFrameView } from "./FrameView";
import type { IEngine } from "./engine/IEngine";
import type { IGameplay } from "./gameplay/IGameplay";
import { type IVec2 } from "./math";
import type { IRender } from "./render/IRender";
import type { GameWorld } from "./world";

export type GameState = 'wait_for_start' | 'running' | 'paused';

/**
 * non-optimized game class
 * For SoA just use number for indexes
 */
export class Game<W extends GameWorld> {
  private readonly world: W;
  private readonly engine: IEngine<W>;
  private readonly renderer: IRender<W>;
  private readonly gameplay: IGameplay<W>;
  private readonly frameView: IFrameView;

  private lastMouseMoveCall: number = 0;

  protected animationFrameId: number = 0;
  protected _prevTimestamp: DOMHighResTimeStamp = 0;

  protected _camera: IVec2 = { x: 0, y: 0 };

  constructor(world: W, engine: IEngine<W>, renderer: IRender<W>, gameplay: IGameplay<W>, frameView: IFrameView) {
    this.world = world;
    this.engine = engine;
    this.renderer = renderer;
    this.gameplay = gameplay;
    this.frameView = frameView;
  }

  get gameState(): GameState {
    return this.frameView.gameState;
  }

  start() {
    if (this.frameView.gameState === 'wait_for_start') {
      this.frameView.gameState = 'running';

      this.frameView.gameState = 'running';

      this.frameView.camera[0] = -this.frameView.halfWidth;
      this.frameView.camera[1] = -this.frameView.halfHeight;  

      this.gameplay.initStartData(this.world, this.frameView);

      this._prevTimestamp = performance.now();
      this.animationFrameId = requestAnimationFrame((now) => this.tick(now));
    }
  }

  tick(now: DOMHighResTimeStamp) {
    if (this.frameView.gameState === 'running') {
      const deltaTime = now - this._prevTimestamp;
      this._prevTimestamp = now;

      if (deltaTime > 200) {
        // ignore cycle
        this.animationFrameId = requestAnimationFrame((now) => this.tick(now));
      } else {
        if (this.frameView.blackHoleTimeRemains <= 0) {
          this.gameplay.tryBlackHoleAppear(this.world, this.frameView);
        }

        this.frameView.blackHoleTimeRemains -= deltaTime;
  
        this.engine.process(this.world, this.frameView);
        this.renderer.render(this.world, this.frameView);
        this.animationFrameId = requestAnimationFrame((now) => this.tick(now));
      }
    }
  }

  /**
   * Modify position to world and search star under mouse
   * 
   * If star found, increase its radius
   */
  public hoverStar(mouseX: number, mouseY: number): void {
    const now = Date.now();
    if (now - this.lastMouseMoveCall < 16) {
      return;
    }

    this.lastMouseMoveCall = now;

    this.gameplay.hoverStar(this.world, this.frameView, mouseX, mouseY);
  }

  /**
   * Move camera to star
   */
  public moveToStar(): void {
    this.gameplay.moveToStar(this.world, this.frameView);
  }

  /**
   * Move camera to black hole
   */
  public moveToBlackHole(): void {
    this.gameplay.moveToBlackHole(this.world, this.frameView);
  }

  pause() {
    if (this.frameView.gameState === 'running') {
      this.frameView.gameState = 'paused';
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = 0;
    }
  }

  resume() {
    if (this.frameView.gameState === 'paused') {
      this.frameView.gameState = 'running';

      this._prevTimestamp = performance.now();
      this.animationFrameId = requestAnimationFrame((now) => this.tick(now));
    }
  }

  stop() {
    if (this.frameView.gameState !== 'wait_for_start') {
      this.frameView.gameState = 'wait_for_start';
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = 0;
      this.world.clear();
      this.renderer.render(this.world, this.frameView);
    }
  }

  restart() {
    this.stop();
    this.start();
  }

  resizeCanvas(width: number, height: number, cameraSet = false) {
    this.frameView.width = width;
    this.frameView.height = height;
    this.frameView.halfWidth = width / 2;
    this.frameView.halfHeight = height / 2;

    if (cameraSet) {
      this.frameView.camera[0] = -this.frameView.halfWidth;
      this.frameView.camera[1] = -this.frameView.halfHeight;
    }
  }

  cameraMove(deltaX: number, deltaY: number) {
    this.frameView.camera[0] -= deltaX;
    this.frameView.camera[1] -= deltaY;

    if (this.frameView.gameState === 'paused') {
      this.renderer.render(this.world, this.frameView);
    }
  }
}
