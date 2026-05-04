import { distanceByDelta } from "../math";
import type { Canvas2dGame } from "../Canvas2dGame";

export function baseEngine(this: Canvas2dGame) {
  const blackHolesCount = this.blackHoles.activeCount;
  const starsCount = this.stars.activeCount;
  const particlesCount = this.particles.activeCount;

  const blackHolesArray = this.blackHoles.getArray();
  const starsArray = this.stars.getArray();
  const particlesArray = this.particles.getArray();

  for (let i = 0; i < blackHolesCount; i++) {
    const blackHoleI = blackHolesArray[i];

    // interaction blackHoleI with other blackHoles
    for (let j = i + 1; j < blackHolesCount; j++) {
      const blackHoleJ = blackHolesArray[j];

      let dx = blackHoleI.x - blackHoleJ.x;
      let dy = blackHoleI.y - blackHoleJ.y;

      const distance = distanceByDelta(dx, dy);

      // Normalize oX and oY vectors
      dx /= distance;
      dy /= distance;
      
      blackHoleI.accelerationX -= dx * blackHoleJ.computedImpactingMass / distance ** 2;
      blackHoleI.accelerationY -= dy * blackHoleJ.computedImpactingMass / distance ** 2;

      blackHoleJ.accelerationX += dx * blackHoleI.computedImpactingMass / distance ** 2;
      blackHoleJ.accelerationY += dy * blackHoleI.computedImpactingMass / distance ** 2;
    }

    // interaction blackHoleI with stars
    for (let j = 0; j < starsCount; j++) {
      const starJ = starsArray[j];

      let dx = blackHoleI.x - starJ.x;
      let dy = blackHoleI.y - starJ.y;

      const distance = distanceByDelta(dx, dy);

      // Normalize oX and oY vectors
      dx /= distance;
      dy /= distance;
      
      blackHoleI.accelerationX -= dx * starJ.computedImpactingMass / distance ** 2;
      blackHoleI.accelerationY -= dy * starJ.computedImpactingMass / distance ** 2;

      starJ.accelerationX += dx * blackHoleI.computedImpactingMass / distance ** 2;
      starJ.accelerationY += dy * blackHoleI.computedImpactingMass / distance ** 2;
    }

    // interaction blackHoleI with particles
    for (let j = 0; j < particlesCount; j++) {
      const particleJ = particlesArray[j];

      let dx = blackHoleI.x - particleJ.x;
      let dy = blackHoleI.y - particleJ.y;

      const distance = distanceByDelta(dx, dy);

      // Normalize oX and oY vectors
      dx /= distance;
      dy /= distance;
      
      blackHoleI.accelerationX -= dx * particleJ.computedImpactingMass / distance ** 2;
      blackHoleI.accelerationY -= dy * particleJ.computedImpactingMass / distance ** 2;

      particleJ.accelerationX += dx * blackHoleI.computedImpactingMass / distance ** 2;
      particleJ.accelerationY += dy * blackHoleI.computedImpactingMass / distance ** 2;
    }
  }

  for (let i = 0; i < starsCount; i++) {
    const starI = starsArray[i];

    // interaction starI with other stars
    for (let j = i + 1; j < starsCount; j++) {
      const starJ = starsArray[j];

      let dx = starI.x - starJ.x;
      let dy = starI.y - starJ.y;

      const distance = distanceByDelta(dx, dy);

      // Normalize oX and oY vectors
      dx /= distance;
      dy /= distance;
      
      starI.accelerationX -= dx * starJ.computedImpactingMass / distance ** 2;
      starI.accelerationY -= dy * starJ.computedImpactingMass / distance ** 2;

      starJ.accelerationX += dx * starI.computedImpactingMass / distance ** 2;
      starJ.accelerationY += dy * starI.computedImpactingMass / distance ** 2;
    }
  }

  this.stars.swapAndPop();
  this.particles.swapAndPop();

  this.stars.update();
  this.particles.update();
}