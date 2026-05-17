import { PI_DIV_8, PI_MUL_2, random } from "../math";
import {
  PTC_AFTER_STR_EXPL_MIN_COUNT,
  PTC_AFTER_STR_EXPL_MAX_COUNT,
  PTC_AFTER_STR_EXPL_MAX_RADIUS,
  PTC_AFTER_STR_EXPL_MIN_RADIUS,
  STR_ABSORB_MPL,
  STR_COLLISION_COEF,
  PTC_AFTER_STAR_EXPL_MIN_VELO,
  PTC_AFTER_STAR_EXPL_MAX_VELO,
  BH_STR_ABSORB_PTCS_GENERATE_MPL,
  BH_STR_ABSORB_PTCS_MIN_RADIUS,
  BH_STR_ABSORB_PTCS_MAX_RADIUS,
  STR_DISAPPEAR_RADIUS,
  SNV_MAX_STRS_SPAWN,
  SNV_MIN_STRS_SPAWN,
  SNV_STR_SPAWN_MIN_VELO,
  SNV_STR_SPAWN_MAX_VELO,
  SNV_STAR_SPAWN_RADIUS,
  SNV_MIN_PTC_SPAWN,
  SNV_MAX_PTC_SPAWN,
  BG_COLLISION_COEF,
  PTC_ABSORBED_BY_BLACK_HOLE_SCORE,
  SNV_EXPLOSION_SCORE,
  // STR_MIN_RADIUS,
  BH_STR_ABSORB_DELTA_RADIUS_MPL,
} from "../objects/const";
import type { IEngine } from "./IEngine";
import { OBJ_STATE_DELETED, OBJ_STATE_EXIST, OBJ_STATE_NEW } from "../objects/aos/Object";
import type { AoSWorld } from "../world/AoSWorld";
import type { IFrameView } from "../FrameView";

export class EngineAoS implements IEngine<AoSWorld> {
  process(world: AoSWorld, frameView: IFrameView): void {
    let blackHolesCount = world.blackHoles.activeCount;
    let starsCount = world.stars.activeCount;
    let particlesCount = world.particles.activeCount;

    const blackHolesArray = world.blackHoles.getArray();
    const starsArray = world.stars.getArray();
    const particlesArray = world.particles.getArray();

    // ENGINE PART

    for (let i = 0; i < blackHolesCount; i++) {
      const blackHoleI = blackHolesArray[i];

      // interaction blackHoleI with other blackHoles
      for (let j = i + 1; j < blackHolesCount; j++) {
        const blackHoleJ = blackHolesArray[j];

        let dx = blackHoleI.x - blackHoleJ.x;
        let dy = blackHoleI.y - blackHoleJ.y;

        let distance = Math.hypot(dx, dy);

        if (blackHoleI.state === OBJ_STATE_EXIST && blackHoleJ.state === OBJ_STATE_EXIST) {
          if (distance < BG_COLLISION_COEF * (blackHoleI.radius + blackHoleJ.radius)) {
            if (blackHoleI.radius > blackHoleJ.radius) {
              blackHoleI.mergeBlackHole(blackHoleJ);
            } else {
              blackHoleJ.mergeBlackHole(blackHoleI);
            }
          }
        }

        // Normalize oX and oY vectors
        dx /= distance;
        dy /= distance;

        // square distance
        distance *= distance;
        
        blackHoleI.accelerationX -= dx * blackHoleJ.impactingMass / distance;
        blackHoleI.accelerationY -= dy * blackHoleJ.impactingMass / distance;

        blackHoleJ.accelerationX += dx * blackHoleI.impactingMass / distance;
        blackHoleJ.accelerationY += dy * blackHoleI.impactingMass / distance;
      }

      // interaction blackHoleI with stars
      for (let j = 0; j < starsCount; j++) {
        const starJ = starsArray[j];

        let dx = blackHoleI.x - starJ.x;
        let dy = blackHoleI.y - starJ.y;

        let distance = Math.hypot(dx, dy);

        // absorb particles from starJ to blackHoleI
        if (starJ.state === OBJ_STATE_EXIST && !starJ.isSupernova) {
          const starSurfaceGravity = starJ.impactingMass / (starJ.radius * starJ.radius);
          const blackHoleToStarSurfaceDistance = distance; // now it's just distance
          const blackHoleImpactOnStarSurface = blackHoleI.impactingMass / (blackHoleToStarSurfaceDistance * blackHoleToStarSurfaceDistance);

          // star inside absorb distance
          if (blackHoleImpactOnStarSurface > starSurfaceGravity) {
            const absorbMpl = blackHoleImpactOnStarSurface / starSurfaceGravity;
            const countParticles = Math.floor(starJ.radius * BH_STR_ABSORB_PTCS_GENERATE_MPL);
            const deltaRadius = distance - blackHoleI.radius - starJ.radius < 0
              ? starJ.radius * 1.1
              : starJ.radius * BH_STR_ABSORB_DELTA_RADIUS_MPL * Math.min(2, absorbMpl);

            if (deltaRadius > starJ.radius || starJ.radius < STR_DISAPPEAR_RADIUS) {
              starJ.state = OBJ_STATE_DELETED;
            } else {
              starJ.deltaRadius -= deltaRadius;
            }

            let alpha = Math.acos(dx / distance);

            if(dy < 0) {
              alpha *= -1;
            }

            let dangle = PI_DIV_8 * Math.min(2, absorbMpl);

            const ndx = dx * blackHoleI.impactingMass / distance ** 3;
            const ndy = dy * blackHoleI.impactingMass / distance ** 3;

            for (let k = 0; k < countParticles; k++) {
              const particle = world.particles.getNewObject();
              const angle = random(alpha - dangle, alpha + dangle);

              particle.x = starJ.x + random(BH_STR_ABSORB_PTCS_MIN_RADIUS, BH_STR_ABSORB_PTCS_MAX_RADIUS) * starJ.radius * Math.cos(angle);
              particle.y = starJ.y + random(BH_STR_ABSORB_PTCS_MIN_RADIUS, BH_STR_ABSORB_PTCS_MAX_RADIUS) * starJ.radius * Math.sin(angle);

              particle.velocityX = starJ.velocityX;
              particle.velocityY = starJ.velocityY;

              particle.accelerationX = ndx * 1.3;
              particle.accelerationY = ndy * 1.3;
            }
          }
        }

        // Normalize oX and oY vectors
        dx /= distance;
        dy /= distance;

        // square distance
        distance *= distance;
        
        blackHoleI.accelerationX -= dx * starJ.impactingMass / distance;
        blackHoleI.accelerationY -= dy * starJ.impactingMass / distance;

        starJ.accelerationX += dx * blackHoleI.impactingMass / distance;
        starJ.accelerationY += dy * blackHoleI.impactingMass / distance;
      }

      // interaction blackHoleI with particles
      for (let j = 0; j < particlesCount; j++) {
        const particleJ = particlesArray[j];

        if (particleJ.state !== OBJ_STATE_EXIST) {
          continue;
        }

        let dx = blackHoleI.x - particleJ.x;
        let dy = blackHoleI.y - particleJ.y;

        let distance = Math.hypot(dx, dy);

        if (blackHoleI.state === OBJ_STATE_EXIST && particleJ.state === OBJ_STATE_EXIST) {
          if (distance < blackHoleI.radius) {
            blackHoleI.absorbParticle(particleJ);
            frameView.particlesAbsorbedByBlackHoles++;
            frameView.score += PTC_ABSORBED_BY_BLACK_HOLE_SCORE;
          }
        }

        // Normalize oX and oY vectors
        dx /= distance;
        dy /= distance;

        // square distance
        distance *= distance;

        // particle not affecting blackhole

        particleJ.accelerationX += 1.3 * dx * blackHoleI.impactingMass / distance;
        particleJ.accelerationY += 1.3 * dy * blackHoleI.impactingMass / distance;
      }
    }

    for (let i = 0; i < starsCount; i++) {
      const starI = starsArray[i];

      // supernova ending processing
      if (starI.isSupernova) {
        const changedToState = starI.supernovaProcessing();

        if (changedToState === 1) {
          const countStars = Math.floor(random(SNV_MIN_STRS_SPAWN, SNV_MAX_STRS_SPAWN));

          let alpha = 0;
          let dAngle = PI_MUL_2 / countStars;
          let velocity = 0;

          for (let j = 0; j < countStars; j++) {
            const star = world.stars.getNewObject();

            alpha += random(0, dAngle * 0.7);
            velocity = random(SNV_STR_SPAWN_MIN_VELO, SNV_STR_SPAWN_MAX_VELO);

            star.x = starI.x + starI.radius * 1.2 * Math.cos(alpha);
            star.y = starI.y + starI.radius * 1.2 * Math.sin(alpha);

            star.radius = SNV_STAR_SPAWN_RADIUS;

            star.velocityX = velocity * Math.cos(alpha);
            star.velocityY = velocity * Math.sin(alpha);

            star.accelerationX = 0;
            star.accelerationY = 0;

            alpha += dAngle;
          }

          const countParticles = Math.floor(random(SNV_MIN_PTC_SPAWN, SNV_MAX_PTC_SPAWN));
          alpha = 0;
          dAngle = PI_MUL_2 / countParticles;

          for (let j = 0; j < countParticles; j++) {
            const particle = world.particles.getNewObject();

            alpha += random(0, dAngle * 0.7);
            velocity = random(SNV_STR_SPAWN_MIN_VELO, SNV_STR_SPAWN_MAX_VELO);

            particle.x = starI.x + starI.radius * random(0.9, 1.1) * Math.cos(alpha);
            particle.y = starI.y + starI.radius * random(0.9, 1.1) * Math.sin(alpha);

            particle.velocityX = velocity * Math.cos(alpha);
            particle.velocityY = velocity * Math.sin(alpha);

            particle.accelerationX = 0;
            particle.accelerationY = 0;

            alpha += dAngle;
          }
        } else if (changedToState === 2) {
          starI.state = OBJ_STATE_NEW;
          starI.isSupernova = false;
          starI.supernovaState = 0;
          frameView.score += SNV_EXPLOSION_SCORE;
        }

        continue;
      }

      // interaction starI with other stars
      for (let j = i + 1; j < starsCount; j++) {
        const starJ = starsArray[j];

        let dx = starI.x - starJ.x;
        let dy = starI.y - starJ.y;

        let distance = Math.hypot(dx, dy);

        if (starI.state === OBJ_STATE_EXIST && starJ.state === OBJ_STATE_EXIST && !starI.isSupernova && !starJ.isSupernova) {
          if (distance < STR_COLLISION_COEF * (starI.radius + starJ.radius)) {
            const radiusRatio = starI.radius / starJ.radius;
            if (radiusRatio >= STR_ABSORB_MPL) {
              starI.mergeStar(starJ);
            } else if (1 / radiusRatio >= STR_ABSORB_MPL) { // invert ratio to check if J absorbs I
              starJ.mergeStar(starI);
            } else {
              starI.state = OBJ_STATE_DELETED;
              starJ.state = OBJ_STATE_DELETED;

              const countForI = Math.floor(starI.radius * random(PTC_AFTER_STR_EXPL_MIN_COUNT, PTC_AFTER_STR_EXPL_MAX_COUNT));
              let alpha = 0;

              for (let k = 0; k < countForI; k++) {
                const particle = world.particles.getNewObject();
                particle.x = starI.x;
                particle.y = starI.y;

                alpha += PI_MUL_2 / countForI;

                particle.x = starI.x + random(PTC_AFTER_STR_EXPL_MIN_RADIUS, PTC_AFTER_STR_EXPL_MAX_RADIUS) * starI.radius * Math.cos(alpha);
                particle.y = starI.y + random(PTC_AFTER_STR_EXPL_MIN_RADIUS, PTC_AFTER_STR_EXPL_MAX_RADIUS) * starI.radius * Math.sin(alpha);

                particle.velocityX = random(PTC_AFTER_STAR_EXPL_MIN_VELO, PTC_AFTER_STAR_EXPL_MAX_VELO) * Math.cos(alpha);
                particle.velocityY = random(PTC_AFTER_STAR_EXPL_MIN_VELO, PTC_AFTER_STAR_EXPL_MAX_VELO) * Math.sin(alpha);
              }
              
              const countForJ = Math.floor(starJ.radius * random(PTC_AFTER_STR_EXPL_MIN_COUNT, PTC_AFTER_STR_EXPL_MAX_COUNT));
              for (let k = 0; k < countForJ; k++) {
                const particle = world.particles.getNewObject();
                particle.x = starJ.x;
                particle.y = starJ.y;

                alpha += PI_MUL_2 / countForJ;

                particle.x = starJ.x + random(PTC_AFTER_STR_EXPL_MIN_RADIUS, PTC_AFTER_STR_EXPL_MAX_RADIUS) * starJ.radius * Math.cos(alpha);
                particle.y = starJ.y + random(PTC_AFTER_STR_EXPL_MIN_RADIUS, PTC_AFTER_STR_EXPL_MAX_RADIUS) * starJ.radius * Math.sin(alpha);

                particle.velocityX = random(PTC_AFTER_STAR_EXPL_MIN_VELO, PTC_AFTER_STAR_EXPL_MAX_VELO) * Math.cos(alpha);
                particle.velocityY = random(PTC_AFTER_STAR_EXPL_MIN_VELO, PTC_AFTER_STAR_EXPL_MAX_VELO) * Math.sin(alpha);
              }
            }
          }
        }

        // Normalize oX and oY vectors
        dx /= distance;
        dy /= distance;

        // square distance
        distance *= distance;

        starI.accelerationX -= dx * starJ.impactingMass / distance;
        starI.accelerationY -= dy * starJ.impactingMass / distance;

        starJ.accelerationX += dx * starI.impactingMass / distance;
        starJ.accelerationY += dy * starI.impactingMass / distance;
      }

      // interaction starI with particles
      // for (let j = i + 1; j < particlesCount; j++) {
      //   const particleJ = particlesArray[j];

      //   if (particleJ.state !== OBJ_STATE_EXIST) {
      //     continue;
      //   }

      //   let dx = starI.x - particleJ.x;
      //   let dy = starI.y - particleJ.y;

      //   let distance = Math.hypot(dx, dy);

      //   if (distance < starI.radius * 0.8 && starI.radius > STR_MIN_RADIUS) {
      //     starI.absorbParticle(particleJ);
      //   }

      //   // Normalize oX and oY vectors
      //   dx /= distance;
      //   dy /= distance;

      //   // square distance
      //   distance *= distance;

      //   particleJ.accelerationX += dx * starI.impactingMass / distance;
      //   particleJ.accelerationY += dy * starI.impactingMass / distance;
      // }
    }

    // DEFRAGMENTATION PART
    world.blackHoles.swapAndPop();
    world.stars.swapAndPop();
    world.particles.swapAndPop();

    // UPDATE PART

    // get new objects count, link on array still valid
    blackHolesCount = world.blackHoles.activeCount;
    starsCount = world.stars.activeCount;
    particlesCount = world.particles.activeCount;

    for (let i = 0; i < blackHolesCount; i++) {
      blackHolesArray[i].update();
    }

    for (let i = 0; i < starsCount; i++) {
      starsArray[i].update();
    }

    for (let i = 0; i < particlesCount; i++) {
      particlesArray[i].update();
    }
  }
}