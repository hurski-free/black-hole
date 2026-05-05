import type { Canvas2dGame } from "../Canvas2dGame";
import { BLACK_HOLE_TIME_APPEAR_MIN_TIME } from "../objects/const";

export function canvas2dRender(this: Canvas2dGame) {
  this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

  const countStars = this.stars.activeCount;
  const countParticles = this.particles.activeCount;
  const countBlackHoles = this.blackHoles.activeCount;

  const stars = this.stars.getArray();
  const particles = this.particles.getArray();
  const blackHoles = this.blackHoles.getArray();

  // FIXME: black hole draw for debug
  for (let i = 0; i < countBlackHoles; i++) {
    const blackHole = blackHoles[i];

    this.ctx.strokeStyle = 'white';
    this.ctx.beginPath();
    this.ctx.arc(blackHole.x, blackHole.y, blackHole.radius, 0, 2 * Math.PI);
    this.ctx.stroke();
  }

  for (let i = 0; i < countStars; i++) {
    const star = stars[i];

    this.ctx.fillStyle = `rgb(${star.colorRGB[0] * 255}, ${star.colorRGB[1] * 255}, ${star.colorRGB[2] * 255})`;
    this.ctx.beginPath();
    this.ctx.arc(star.x, star.y, star.radius, 0, 2 * Math.PI);
    this.ctx.fill();
  }

  for (let i = 0; i < countParticles; i++) {
    this.ctx.fillStyle = 'white';
    this.ctx.beginPath();
    this.ctx.arc(particles[i].x, particles[i].y, particles[i].radius, 0, 2 * Math.PI);
    this.ctx.fill();
  }

  this.ctx.fillStyle = 'white';
  this.ctx.fillText(`Stars: ${countStars}`, 10, 20);
  this.ctx.fillText(`Particles: ${countParticles}`, 10, 40);
  this.ctx.fillText(`Black holes: ${this.blackHoles.activeCount}`, 10, 60);

  if (this.blackHoleTimeRemains <= BLACK_HOLE_TIME_APPEAR_MIN_TIME) {
    const timeRemain = (this.blackHoleTimeRemains / 1000).toFixed(1); // round to 0.1 seconds
    // console.log(this.blackHoleTimeRemains, timeRemain);
    const blackHoleColor = Math.round(255 * this.blackHoleTimeRemains / BLACK_HOLE_TIME_APPEAR_MIN_TIME);
    this.ctx.fillStyle = `rgb(${255},${blackHoleColor},${blackHoleColor})`;
    this.ctx.fillText(`Black hole time remains: ${timeRemain}`, 10, this.height - 10);
  }
}
