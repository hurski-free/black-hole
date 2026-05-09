import { circleSquare } from "../../math";
import { BH_GRAVITY_MPL } from "../const";
import { GameObject } from "./Object";
import type { Particle } from "./Particle";

export class BlackHole extends GameObject {
  constructor() {
    super();
    this.objectGravityCoefficient = BH_GRAVITY_MPL;
  }

  absorbParticle(particle: Particle) {
    this.deltaRadius += Math.PI / (circleSquare(this.radius));
    particle.state = 3;
  }

  mergeBlackHole(other: BlackHole) {
    this.radius = Math.sqrt(this.radius ** 2 + other.radius ** 2);
    other.state = 3;
  }
}