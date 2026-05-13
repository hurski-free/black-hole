
import { EngineClassWorkflow } from "./engine/EngineClassWorkflow";
import { Game } from "./Game";
import { WEBGL_BLACK_HOLE_POOL_CAPACITY, WEBGL_PARTICLE_POOL_CAPACITY, WEBGL_STAR_POOL_CAPACITY } from "./game-webgl.const";
import { random } from "./math";
import { BlackHole } from "./objects/class/BlackHole";
import { ObjectPool } from "./objects/class/ObjectPool";
import { Particle } from "./objects/class/Particle";
import { Star } from "./objects/class/Star";
import { 
  BH_FIRST_APPEAR_TIME_REMAINS,
  BH_APPEAR_RADIUS,
  BH_NEXT_APPEAR_TIME_REMAINS,
  STR_HOVER_RADIUS_INC,
  STR_MIN_RADIUS,
} from "./objects/const";
import { WebGL2dRender } from "./render/WebGL2Render";
import { blackHoleShader } from "./WebGL/shaders/BlackHoleShader";
import { particleShader } from "./WebGL/shaders/ParticleShader";
import { starShader } from "./WebGL/shaders/StarShader";
import { textShader } from "./WebGL/shaders/TextShader";
import { GLProgram } from "./WebGL/WebGLProgram";

interface IWebGLGameConfig {
  ctx: WebGL2RenderingContext;
}

/**
 * non-optimized game class
 */
export class WebGLGame extends Game<BlackHole, Star, Particle> {
  private starQueueIndex = 0;
  private blackHoleQueueIndex = 0;

  constructor(cfg: IWebGLGameConfig) {
    if (!(cfg.ctx instanceof WebGL2RenderingContext)) {
      throw new Error('ctx must be a WebGL2RenderingContext');
    }

    const blackHoles = new ObjectPool<BlackHole>(WEBGL_BLACK_HOLE_POOL_CAPACITY, () => new BlackHole());
    const stars = new ObjectPool<Star>(WEBGL_STAR_POOL_CAPACITY, () => new Star());
    const particles = new ObjectPool<Particle>(WEBGL_PARTICLE_POOL_CAPACITY, () => new Particle());

    const renderer = new WebGL2dRender({
      ctx: cfg.ctx,
      shaders: {
        starShader: new GLProgram(cfg.ctx, starShader),
        particleShader: new GLProgram(cfg.ctx, particleShader),
        blackHoleShader: new GLProgram(cfg.ctx, blackHoleShader),
        textShader: new GLProgram(cfg.ctx, textShader),
      },
    });

    super({
      engine: new EngineClassWorkflow(),
      renderer,
      blackHoles,
      stars,
      particles,
    });
  }

  protected initStartData() {
    const star1 = this.stars.getNewObject();
    star1.x = random(this._halfWidth * 0.2, this._halfWidth);
    star1.y = random(-this._halfHeight * 0.8, this._halfHeight * 0.8);
    star1.velocityX = 0;
    star1.velocityY = 0;
    star1.accelerationX = 0;
    star1.accelerationY = 0;
    star1.radius = 40;
    star1.deltaRadius = 0;
    star1.isSupernova = false;
    
    const star2 = this.stars.getNewObject();
    star2.x = random(-this._halfWidth, -this._halfWidth * 0.2);
    star2.y = random(-this._halfHeight * 0.8, this._halfHeight * 0.8);
    star2.velocityX = 0;
    star2.velocityY = 0;
    star2.accelerationX = 0;
    star2.accelerationY = 0;
    star2.radius = 40;
    star2.deltaRadius = 0;
    star2.isSupernova = false;

    // const star1 = this.stars.getNewObject();
    // star1.x = -200;
    // star1.y = 100;
    // star1.velocityX = 0.3;
    // star1.velocityY = 0.16;
    // star1.accelerationX = 0;
    // star1.accelerationY = 0;
    // star1.radius = 60;
    // star1.deltaRadius = 0;

    // const blackHole = this.blackHoles.getNewObject();
    // blackHole.x = 300;
    // blackHole.y = 100;
    // blackHole.velocityX = -0.1;
    // blackHole.velocityY = -0.05;
    // blackHole.accelerationX = 0;
    // blackHole.accelerationY = 0;
    // blackHole.deltaRadius = 0;
    // blackHole.radius = 20;

    this._blackHoleTimeRemains = BH_FIRST_APPEAR_TIME_REMAINS;
  }
  protected tryBlackHoleAppear() {
    const blackHole = this.blackHoles.getNewObject();

    let x = this._camera.x;
    let y = this._camera.y;

    if (this.stars.activeCount > 0) {
      const star = this.stars.at(0);

      x = star.x;
      y = star.y;
    } else if (this.blackHoles.activeCount > 0) {
      const blackHole = this.blackHoles.at(0);

      x = blackHole.x;
      y = blackHole.y;
    }

    blackHole.x = x + random(-this._halfWidth, this._halfWidth);
    blackHole.y = y + random(-this._halfHeight, this._halfHeight);
    blackHole.velocityX = 0;
    blackHole.velocityY = 0;
    blackHole.accelerationX = 0;
    blackHole.accelerationY = 0;
    blackHole.deltaRadius = 0;
    blackHole.radius = BH_APPEAR_RADIUS;

    this._blackHoleTimeRemains = BH_NEXT_APPEAR_TIME_REMAINS;
  }

  public hoverStar(mouseX: number, mouseY: number): void {
    const x = mouseX + this._camera.x;
    const y = mouseY + this._camera.y;

    const starsCount = this.stars.activeCount;
    const stars = this.stars.getArray();
    
    for (let i = 0; i < starsCount; i++) {
      // avoid hover on not existing or supernova, also star less than disappear radius not affected by hover
      if (stars[i].state === 2 && !stars[i].isSupernova && stars[i].radius > STR_MIN_RADIUS) {
        const star = stars[i];
        const dis = Math.hypot(x - star.x, y - star.y);
        
        if (dis < star.radius) {
          star.deltaRadius += STR_HOVER_RADIUS_INC;
        }
      }
    }
  }

  public moveToStar(): void {
    const starsCount = this.stars.activeCount;
    if (starsCount < 1) return;

    if (this.starQueueIndex >= starsCount) {
      this.starQueueIndex = 0;
    }

    
    const star = this.stars.at(this.starQueueIndex);
    this._camera.x = star.x - this.halfWidth;
    this._camera.y = star.y - this.halfHeight;

    this.starQueueIndex += 1;
    if (this.starQueueIndex >= starsCount) {
      this.starQueueIndex = 0;
    }

    if (this.gameState === 'paused') {
      this.renderer.render(this);
    }
  }

  public moveToBlackHole(): void {
    const blackHolesCount = this.blackHoles.activeCount;
    if (blackHolesCount < 1) return;

    if (this.blackHoleQueueIndex >= blackHolesCount) {
      this.blackHoleQueueIndex = 0;
    }

    const blackHole = this.blackHoles.at(this.blackHoleQueueIndex);
    this._camera.x = blackHole.x - this.halfWidth;
    this._camera.y = blackHole.y - this.halfHeight;

    this.blackHoleQueueIndex += 1;
    if (this.blackHoleQueueIndex >= blackHolesCount) {
      this.blackHoleQueueIndex = 0;
    }

    if (this.gameState === 'paused') {
      this.renderer.render(this);
    }
  }
}
