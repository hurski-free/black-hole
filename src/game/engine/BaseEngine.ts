import { distanceByDelta, PI_DIV_2, PI_MUL_2, random } from "../math";
import type { Canvas2dGame } from "../Canvas2dGame";
import {
  PARTICLES_AFTER_STAR_EXP_MIN_COUNT,
  PARTICLES_AFTER_STAR_EXP_MAX_COUNT,
  PARTICLES_AFTER_STAR_EXP_MAX_R,
  PARTICLES_AFTER_STAR_EXP_MIN_R,
  STAR_ABSORB_MULTIPLIER,
  STAR_COLLISION_COEFFICIENT,
  PARTICLES_AFTER_STAR_EXP_MIN_V,
  PARTICLES_AFTER_STAR_EXP_MAX_V,
  BLACK_HOLE_STAR_ABSORB_DISTANCE_MULTIPLIER,
  BLACK_HOLE_STAR_ABSORB_PARTICLES_GENERATE_MULTIPLIER,
  BLACK_HOLE_STAR_ABSORB_PARTICLES_MIN_R,
  BLACK_HOLE_STAR_ABSORB_PARTICLES_MAX_R,
  BLACK_HOLE_STAR_ABSORB_DISTANCE_MIN,
  BLACK_HOLE_STAR_ABSORB_RADIUS_MULTIPLIER,
  STAR_DISAPPEAR_RADIUS,
} from "../objects/const";

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

      let distance = distanceByDelta(dx, dy);

      // Normalize oX and oY vectors
      dx /= distance;
      dy /= distance;

      // square distance
      distance *= distance;
      
      blackHoleI.accelerationX -= dx * blackHoleJ.computedImpactingMass / distance;
      blackHoleI.accelerationY -= dy * blackHoleJ.computedImpactingMass / distance;

      blackHoleJ.accelerationX += dx * blackHoleI.computedImpactingMass / distance;
      blackHoleJ.accelerationY += dy * blackHoleI.computedImpactingMass / distance;
    }

    // interaction blackHoleI with stars
    for (let j = 0; j < starsCount; j++) {
      const starJ = starsArray[j];
      console.log(starJ.radius);

      let dx = blackHoleI.x - starJ.x;
      let dy = blackHoleI.y - starJ.y;

      let distance = distanceByDelta(dx, dy);

      if (starJ.state === 'exist') {
        const absorbDistance = Math.max(blackHoleI.radius * BLACK_HOLE_STAR_ABSORB_DISTANCE_MULTIPLIER, BLACK_HOLE_STAR_ABSORB_DISTANCE_MIN);
        if (distance < absorbDistance) {
          const absorbCoefficient = 1 - distance / absorbDistance;

          const countParticles = Math.floor(starJ.radius * absorbCoefficient * BLACK_HOLE_STAR_ABSORB_PARTICLES_GENERATE_MULTIPLIER);
          const deltaRadius = starJ.radius * absorbCoefficient * BLACK_HOLE_STAR_ABSORB_RADIUS_MULTIPLIER;

          if (deltaRadius > starJ.radius || starJ.radius < STAR_DISAPPEAR_RADIUS) {
            starJ.state = 'deleted';
          } else {
            starJ.deltaRadius -= deltaRadius;
          }

          // let alpha = 0;
          let alpha = Math.acos(dx / distance);

          if(dy < 0) {
            alpha *= -1;
          }
    
          alpha += PI_DIV_2;

          let dangle = Math.PI * (1.0 - 1.0 / countParticles);
          // let dr = dangle / Math.PI * 0.09;

          for (let k = 0; k < countParticles; k++) {
            const particle = this.particles.getObject();
            const angle = random(alpha - dangle, alpha + dangle);

            // alpha += PI_MUL_2 / countParticles;
            particle.x = starJ.x + random(BLACK_HOLE_STAR_ABSORB_PARTICLES_MIN_R, BLACK_HOLE_STAR_ABSORB_PARTICLES_MAX_R) * starJ.radius * Math.cos(angle);
            particle.y = starJ.y + random(BLACK_HOLE_STAR_ABSORB_PARTICLES_MIN_R, BLACK_HOLE_STAR_ABSORB_PARTICLES_MAX_R) * starJ.radius * Math.sin(angle);

            particle.velocityX = starJ.velocityX;
            particle.velocityY = starJ.velocityY;
          }
        }
      }

      // Normalize oX and oY vectors
      dx /= distance;
      dy /= distance;

      // square distance
      distance *= distance;
      
      blackHoleI.accelerationX -= dx * starJ.computedImpactingMass / distance;
      blackHoleI.accelerationY -= dy * starJ.computedImpactingMass / distance;

      starJ.accelerationX += dx * blackHoleI.computedImpactingMass / distance;
      starJ.accelerationY += dy * blackHoleI.computedImpactingMass / distance;
    }

    // interaction blackHoleI with particles
    for (let j = 0; j < particlesCount; j++) {
      const particleJ = particlesArray[j];

      let dx = blackHoleI.x - particleJ.x;
      let dy = blackHoleI.y - particleJ.y;

      let distance = distanceByDelta(dx, dy);

      if (blackHoleI.state === 'exist' && particleJ.state === 'exist') {
        if (distance < blackHoleI.radius) {
          blackHoleI.absorbParticle(particleJ);
        }
      }

      // Normalize oX and oY vectors
      dx /= distance;
      dy /= distance;

      // square distance
      distance *= distance;

      blackHoleI.accelerationX -= dx * particleJ.computedImpactingMass / distance;
      blackHoleI.accelerationY -= dy * particleJ.computedImpactingMass / distance;

      particleJ.accelerationX += dx * blackHoleI.computedImpactingMass / distance;
      particleJ.accelerationY += dy * blackHoleI.computedImpactingMass / distance;
    }
  }

  for (let i = 0; i < starsCount; i++) {
    const starI = starsArray[i];

    // interaction starI with other stars
    for (let j = i + 1; j < starsCount; j++) {
      const starJ = starsArray[j];

      let dx = starI.x - starJ.x;
      let dy = starI.y - starJ.y;

      let distance = distanceByDelta(dx, dy);

      if (starI.state === 'exist' && starJ.state === 'exist') {
        if (distance < starI.radius * STAR_COLLISION_COEFFICIENT + starJ.radius * STAR_COLLISION_COEFFICIENT) {
          const radiusRatio = starI.radius / starJ.radius;
          if (radiusRatio >= STAR_ABSORB_MULTIPLIER) {
            starI.absorb(starJ);
          } else if (1 / radiusRatio >= STAR_ABSORB_MULTIPLIER) { // invert ratio to check if J absorbs I
            starJ.absorb(starI);
          } else {
            starI.state = 'deleted';
            starJ.state = 'deleted';

            const countForI = Math.floor(starI.radius * PARTICLES_AFTER_STAR_EXP_MIN_COUNT + (PARTICLES_AFTER_STAR_EXP_MAX_COUNT - PARTICLES_AFTER_STAR_EXP_MIN_COUNT) * Math.random());
            let alpha = 0;

            for (let k = 0; k < countForI; k++) {
              const particle = this.particles.getObject();
              particle.x = starI.x;
              particle.y = starI.y;

              alpha += PI_MUL_2 / countForI;

              particle.x = starI.x + random(PARTICLES_AFTER_STAR_EXP_MIN_R, PARTICLES_AFTER_STAR_EXP_MAX_R) * starI.radius * Math.cos(alpha);
              particle.y = starI.y + random(PARTICLES_AFTER_STAR_EXP_MIN_R, PARTICLES_AFTER_STAR_EXP_MAX_R) * starI.radius * Math.sin(alpha);

              particle.velocityX = random(PARTICLES_AFTER_STAR_EXP_MIN_V, PARTICLES_AFTER_STAR_EXP_MAX_V) * Math.cos(alpha);
              particle.velocityY = random(PARTICLES_AFTER_STAR_EXP_MIN_V, PARTICLES_AFTER_STAR_EXP_MAX_V) * Math.sin(alpha);
            }
            
            const countForJ = Math.floor(starJ.radius * PARTICLES_AFTER_STAR_EXP_MIN_COUNT + (PARTICLES_AFTER_STAR_EXP_MAX_COUNT - PARTICLES_AFTER_STAR_EXP_MIN_COUNT) * Math.random());
            for (let k = 0; k < countForJ; k++) {
              const particle = this.particles.getObject();
              particle.x = starJ.x;
              particle.y = starJ.y;

              alpha += PI_MUL_2 / countForJ;

              particle.x = starJ.x + random(PARTICLES_AFTER_STAR_EXP_MIN_R, PARTICLES_AFTER_STAR_EXP_MAX_R) * starJ.radius * Math.cos(alpha);
              particle.y = starJ.y + random(PARTICLES_AFTER_STAR_EXP_MIN_R, PARTICLES_AFTER_STAR_EXP_MAX_R) * starJ.radius * Math.sin(alpha);

              particle.velocityX = random(PARTICLES_AFTER_STAR_EXP_MIN_V, PARTICLES_AFTER_STAR_EXP_MAX_V) * Math.cos(alpha);
              particle.velocityY = random(PARTICLES_AFTER_STAR_EXP_MIN_V, PARTICLES_AFTER_STAR_EXP_MAX_V) * Math.sin(alpha);
            }
          }
        }
      }

      // Normalize oX and oY vectors
      dx /= distance;
      dy /= distance;

      // square distance
      distance *= distance;

      starI.accelerationX -= dx * starJ.computedImpactingMass / distance;
      starI.accelerationY -= dy * starJ.computedImpactingMass / distance;

      starJ.accelerationX += dx * starI.computedImpactingMass / distance;
      starJ.accelerationY += dy * starI.computedImpactingMass / distance;
    }
  }

  this.blackHoles.swapAndPop();
  this.stars.swapAndPop();
  this.particles.swapAndPop();

  this.blackHoles.update();
  this.stars.update();
  this.particles.update();
}