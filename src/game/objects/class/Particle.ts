import { PARTICLE_RADIUS } from "../const";
import { Object } from "./Object";

export class Particle extends Object {

  constructor() {
    super();
    this.radius = PARTICLE_RADIUS;
  }
}