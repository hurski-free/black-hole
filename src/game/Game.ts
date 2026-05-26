import type { IFrameView } from "./FrameView";
import type { IGameSession } from "./GameSession";
import type { IEngine } from "./engine/IEngine";
import type { IGameplay } from "./gameplay/IGameplay";
import type { IRender } from "./render/IRender";
import type { GameWorld } from "./world";

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
  private readonly gameSession: IGameSession;

  private lastMouseMoveCall: number = 0;

  protected animationFrameId: number = 0;
  protected _prevTimestamp: DOMHighResTimeStamp = 0;

  constructor(world: W, engine: IEngine<W>, renderer: IRender<W>, gameplay: IGameplay<W>, frameView: IFrameView, gameSession: IGameSession) {
    this.world = world;
    this.engine = engine;
    this.renderer = renderer;
    this.gameplay = gameplay;
    this.frameView = frameView;
    this.gameSession = gameSession;
  }

  get gameState() {
    return this.gameSession.gameState;
  }

  start() {
    if (this.gameSession.gameState === 'wait_for_start') {
      this.gameSession.gameState = 'running';

      this.frameView.camera[0] = -this.frameView.halfWidth;
      this.frameView.camera[1] = -this.frameView.halfHeight;  

      this.gameplay.initStartData(this.world, this.frameView, this.gameSession);

      this._prevTimestamp = performance.now();
      this.animationFrameId = requestAnimationFrame((now) => this.tick(now));
    }
  }

  tick(now: DOMHighResTimeStamp) {
    if (this.gameSession.gameState === 'running') {
      const deltaTime = now - this._prevTimestamp;
      this._prevTimestamp = now;

      if (deltaTime > 200) {
        // ignore cycle
        this.animationFrameId = requestAnimationFrame((now) => this.tick(now));
      } else {
        if (this.gameSession.blackHoleTimeRemains <= 0) {
          this.gameplay.tryBlackHoleAppear(this.world, this.frameView, this.gameSession);
        }

        this.gameSession.blackHoleTimeRemains -= deltaTime;
  
        this.engine.process(this.world, this.frameView, this.gameSession);
        this.renderer.render(this.world, this.frameView, this.gameSession);
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
    if (this.gameSession.gameState === 'running') {
      this.gameSession.gameState = 'paused';
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = 0;
    }
  }

  resume() {
    if (this.gameSession.gameState === 'paused') {
      this.gameSession.gameState = 'running';

      this._prevTimestamp = performance.now();
      this.animationFrameId = requestAnimationFrame((now) => this.tick(now));
    }
  }

  stop() {
    if (this.gameSession.gameState !== 'wait_for_start') {
      this.gameSession.gameState = 'wait_for_start';
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = 0;
      this.world.clear();
      this.renderer.render(this.world, this.frameView, this.gameSession);
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

    if (this.gameSession.gameState === 'paused') {
      this.renderer.render(this.world, this.frameView, this.gameSession);
    }
  }

  cameraMove(deltaX: number, deltaY: number) {
    this.frameView.camera[0] -= deltaX;
    this.frameView.camera[1] -= deltaY;

    if (this.gameSession.gameState === 'paused') {
      this.renderer.render(this.world, this.frameView, this.gameSession);
    }
  }
}
