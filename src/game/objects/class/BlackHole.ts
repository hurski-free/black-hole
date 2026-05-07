import { circleSquare } from "../../math";
import { BH_GRAVITY_MPL } from "../const";
import { GameObject } from "./Object";
import type { Particle } from "./Particle";

export class BlackHole extends GameObject {
  countParticlesAbsorbed: number = 0;

  constructor() {
    super();
    this.objectGravityCoefficient = BH_GRAVITY_MPL;
  }

  absorbParticle(particle: Particle) {
    this.deltaRadius += Math.PI / (circleSquare(this.radius));

    this.countParticlesAbsorbed++;
    particle.state = 3;
  }
}