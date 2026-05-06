import { circleSquare } from "../../math";
import { BLACK_HOLE_GRAVITY_COEFFICIENT } from "../const";
import { GameObject } from "./Object";
import type { Particle } from "./Particle";

export class BlackHole extends GameObject {
  countParticlesAbsorbed: number = 0;

  constructor() {
    super();
    this.objectGravityCoefficient = BLACK_HOLE_GRAVITY_COEFFICIENT;
  }

  absorbParticle(particle: Particle) {
    this.deltaRadius += Math.PI / (circleSquare(this.radius));

    this.countParticlesAbsorbed++;
    particle.state = 3;
  }
}