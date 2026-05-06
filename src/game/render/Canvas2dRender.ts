import type { Game } from "../Game";
import type { BlackHole } from "../objects/class/BlackHole";
import type { Particle } from "../objects/class/Particle";
import type { Star } from "../objects/class/Star";
import { BLACK_HOLE_TIME_APPEAR_MIN_TIME } from "../objects/const";
import type { IRender } from "./IRender";

export class Canvas2dRender implements IRender<BlackHole, Star, Particle> {
  private ctx: CanvasRenderingContext2D;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  render(game: Game<BlackHole, Star, Particle>): void {
    const ctx = this.ctx;
    
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    ctx.save();
    ctx.translate(game.camera.x, game.camera.y);

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

    // FIXME: black hole draw for debug
    for (let i = 0; i < countBlackHoles; i++) {
      const blackHole = blackHoles[i];

      ctx.strokeStyle = 'white';
      ctx.beginPath();
      ctx.arc(blackHole.x, blackHole.y, blackHole.radius, 0, 2 * Math.PI);
      ctx.stroke();
    }

    for (let i = 0; i < countStars; i++) {
      const star = stars[i];

      ctx.fillStyle = `rgb(${star.colorRGB[0] * 255}, ${star.colorRGB[1] * 255}, ${star.colorRGB[2] * 255})`;
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.radius, 0, 2 * Math.PI);
      ctx.fill();
    }

    ctx.restore();

    ctx.fillStyle = 'white';
    ctx.font = '16px Arial';
    ctx.fillText(`Stars: ${countStars}`, 10, 20);
    ctx.fillText(`Particles: ${countParticles}`, 10, 40);
    ctx.fillText(`Black holes: ${countBlackHoles}`, 10, 60);

    if (game.blackHoleTimeRemains <= BLACK_HOLE_TIME_APPEAR_MIN_TIME) {
      const timeRemain = (game.blackHoleTimeRemains / 1000).toFixed(1); // round to 0.1 seconds
      const blackHoleColor = Math.round(255 * game.blackHoleTimeRemains / BLACK_HOLE_TIME_APPEAR_MIN_TIME);
      ctx.fillStyle = `rgb(${255},${blackHoleColor},${blackHoleColor})`;
      ctx.fillText(`Black hole time remains: ${timeRemain}`, 10, game.height - 10);
    }
  }
}
