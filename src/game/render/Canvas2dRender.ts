import type { Canvas2dGame } from "../Canvas2dGame";

export function canvas2dRender(this: Canvas2dGame) {
  this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

  const countStars = this.stars.activeCount;
  const countParticles = this.particles.activeCount;

  const stars = this.stars.getArray();
  const particles = this.particles.getArray();

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
}
