
import { EngineClassWorkflow } from "./engine/EngineClassWorkflow";
import { Game } from "./Game";
import { random } from "./math";
import { BlackHole } from "./objects/class/BlackHole";
import { ObjectPool } from "./objects/class/ObjectPool";
import { Particle } from "./objects/class/Particle";
import { Star } from "./objects/class/Star";
import { 
  BLACK_HOLE_POOL_CAPACITY, 
  FIRST_BLACK_HOLE_TIME_REMAINS, 
  INITIAL_BLACK_HOLE_RADIUS, 
  NEXT_BLACK_HOLE_TIME_REMAINS, 
  PARTICLE_POOL_CAPACITY, 
  STAR_POOL_CAPACITY 
} from "./objects/const";
import { Canvas2dRender } from "./render/Canvas2dRender";

interface ICanvas2dGameConfig {
  ctx: CanvasRenderingContext2D;
}

/**
 * non-optimized game class
 */
export class Canvas2dGame extends Game<BlackHole, Star, Particle> {
  constructor(cfg: ICanvas2dGameConfig) {
    if (!(cfg.ctx instanceof CanvasRenderingContext2D)) {
      throw new Error('ctx must be a CanvasRenderingContext2D');
    }

    const blackHoles = new ObjectPool<BlackHole>(BLACK_HOLE_POOL_CAPACITY, () => new BlackHole());
    const stars = new ObjectPool<Star>(STAR_POOL_CAPACITY, () => new Star());
    const particles = new ObjectPool<Particle>(PARTICLE_POOL_CAPACITY, () => new Particle());

    super({
      engine: new EngineClassWorkflow(),
      renderer: new Canvas2dRender(cfg.ctx),
      blackHoles,
      stars,
      particles,
    });
  }

  protected initStartData() {
    const star1 = this.stars.getNewObject();
    const star2 = this.stars.getNewObject();

    star1.x = random(0, this._halfWidth);
    star1.y = random(-this._halfHeight, this._halfHeight);
    star1.velocityX = 0;
    star1.velocityY = 0;
    star1.accelerationX = 0;
    star1.accelerationY = 0;
    star1.radius = 70;

    star2.x = random(-this._halfWidth, 0);
    star2.y = random(-this._halfHeight, this._halfHeight);
    star2.velocityX = 0;
    star2.velocityY = 0;
    star2.accelerationX = 0;
    star2.accelerationY = 0;
    star2.radius = 40;

    // this._blackHoleTimeRemains = FIRST_BLACK_HOLE_TIME_REMAINS * 10000;
    this._blackHoleTimeRemains = FIRST_BLACK_HOLE_TIME_REMAINS;
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
    blackHole.radius = INITIAL_BLACK_HOLE_RADIUS;

    this._blackHoleTimeRemains = NEXT_BLACK_HOLE_TIME_REMAINS;
  }
}
