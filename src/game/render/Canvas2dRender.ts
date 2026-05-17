import type { Translator } from "../../i18n";
import type { Game } from "../Game";
import type { BlackHole } from "../objects/class/BlackHole";
import type { Particle } from "../objects/class/Particle";
import type { Star } from "../objects/class/Star";
import { BH_SHOW_TIME_APPEAR_MIN_TIME } from "../objects/const";
import type { IRender } from "./IRender";

export interface ICanvas2dRenderConfig {
  ctx: CanvasRenderingContext2D;
  translator: Translator;
}

export class Canvas2dRender implements IRender<BlackHole, Star, Particle> {
  readonly translator: Translator;
  
  private ctx: CanvasRenderingContext2D;

  constructor(cfg: ICanvas2dRenderConfig) {
    this.translator = cfg.translator;
    this.ctx = cfg.ctx;
  }

  render(game: Game<BlackHole, Star, Particle>): void {
    const ctx = this.ctx;
    
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    ctx.save();
    ctx.translate(-game.camera.x, -game.camera.y);

    const countStars = game.stars.activeCount;
    const countParticles = game.particles.activeCount;
    const countBlackHoles = game.blackHoles.activeCount;

    const stars = game.stars.getArray();
    const particles = game.particles.getArray();
    const blackHoles = game.blackHoles.getArray();

    for (let i = 0; i < countParticles; i++) {
      ctx.fillStyle = 'white';
      ctx.beginPath();
      ctx.arc(particles[i].x, particles[i].y, particles[i].radius, 0, 2 * Math.PI);
      ctx.fill();
    }

    for (let i = 0; i < countBlackHoles; i++) {
      const blackHole = blackHoles[i];

      ctx.strokeStyle = 'white';
      ctx.beginPath();
      ctx.arc(blackHole.x, blackHole.y, blackHole.radius, 0, 2 * Math.PI);
      ctx.stroke();
    }

    for (let i = 0; i < countStars; i++) {
      const star = stars[i];

      const gradient = ctx.createRadialGradient(
        star.x, star.y, 0, 
        star.x, star.y, star.radius * 1.7
      );

      const r = star.colorRGB[0] * 255;
      const g = star.colorRGB[1] * 255;
      const b = star.colorRGB[2] * 255;

      gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, 1)`);
      gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);

      // star halo
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.radius * 1.7, 0, 2 * Math.PI);
      ctx.fill();

      ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.radius, 0, 2 * Math.PI);
      ctx.fill();
    }

    ctx.restore();

    ctx.fillStyle = 'white';
    ctx.font = '700 24px Inter, Arial, sans-serif';
    ctx.fillText(this.translator.t('game.score', { score: game.score.toFixed(3) }), 16, 26);
    ctx.fillText(this.translator.t('game.stars', { count: countStars }), 16, 56);
    ctx.fillText(this.translator.t('game.blackHoles', { count: countBlackHoles }), 16, 86);

    // draw in bottom left corner
    ctx.fillText(this.translator.t('game.particles', { count: countParticles }), 16, game.height - 32);
    ctx.fillText(this.translator.t('game.particlesAbsorbedByBlackHoles', { count: game.particlesAbsorbedByBlackHoles }), 16, game.height - 4);

    if (game.blackHoleTimeRemains <= BH_SHOW_TIME_APPEAR_MIN_TIME) {
      const timeRemain = (game.blackHoleTimeRemains / 1000).toFixed(1); // round to 0.1 seconds
      const blackHoleColor = Math.round(255 * game.blackHoleTimeRemains / BH_SHOW_TIME_APPEAR_MIN_TIME);
      ctx.fillStyle = `rgb(${255},${blackHoleColor},${blackHoleColor})`;
      const text = this.translator.t('game.blackHoleTimeRemains', { timeRemain });
      const textWidth = ctx.measureText(text).width;

      ctx.fillText(text, game.halfWidth - textWidth / 2, game.height - 10);
    }
  }
}
