import { PARTICLE_RADIUS } from "../const";
import { GameObject } from "./Object";

export class Particle extends GameObject {
  constructor() {
    super();
    this.radius = PARTICLE_RADIUS;
  }
}