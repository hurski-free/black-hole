import { circleSquare, type vec3 } from "../../math";
import { 
  STR_DISAPPEAR_RADIUS,
  STR_GRAVITY_MPL,
  STR_MAX_MINUS_MIN,
  STR_MAX_RADIUS,
  STR_MIN_RADIUS,
  STR_RADIUS_SUB_ON_UPDATE,
  SNV_RADIUS_DEC,
  SNV_RADIUS_INC,
  SNV_RADIUS_MAX,
  SNV_RADIUS_MIN,
} from "../const";
import { GameObject } from "./Object";
import type { Particle } from "./Particle";

/**
 * 0 - expanding
 * 
 * 1 - shrinking
 * 
 * 2 - end
 */
export type SupernovaState = 0 | 1 | 2;

export class Star extends GameObject {
  /**
   * Normalized color in range [0, 1]
   * [red, green, blue]
   */
  colorRGB: vec3 = [0, 0, 0];

  isSupernova: boolean = false;

  /**
   * 0 - expanding
   * 
   * 1 - shrinking
   * 
   * 2 - end
   */
  supernovaState: SupernovaState = 0;

  constructor() {
    super();
    this.objectGravityCoefficient = STR_GRAVITY_MPL;
  }

  update() {
    if (this.isSupernova) {
      if (this.supernovaState === 0) {
        this.deltaRadius += SNV_RADIUS_INC;
      } else if (this.supernovaState === 1) {
        this.deltaRadius -= SNV_RADIUS_DEC;
      }
    } else {
      this.deltaRadius -= STR_RADIUS_SUB_ON_UPDATE;
    }

    super.update();

    // if after update radius is greater than max radius, star becomes supernova
    if (this.radius > STR_MAX_RADIUS) {
      this.isSupernova = true;
    }

    if (this.radius < STR_DISAPPEAR_RADIUS) {
      this.state = 3;
    }

    this.computeColorRGB();
  }

  /**
   * @returns new supernova state or null if no state changed
   */
  supernovaProcessing() {
    let changedTo: SupernovaState | null = null;

    if (this.isSupernova) {
      if (this.supernovaState === 0) {
        if (this.radius > SNV_RADIUS_MAX) {
          this.supernovaState = 1;
          changedTo = 1;
        }
      } else if (this.supernovaState === 1) {
        if (this.radius < SNV_RADIUS_MIN) {
          this.supernovaState = 2;
          changedTo = 2;
        }
      }
    }

    return changedTo;
  }

  private computeColorRGB() {
    let r = 2.0 * (this.radius - STR_MIN_RADIUS) / STR_MAX_MINUS_MIN;

    this.colorRGB[0] = Math.abs(r - 0.5) - Math.abs(r - 1.0) + 0.5;
    this.colorRGB[1] = Math.abs(2.0 - r) - Math.abs(1.5 - r) + r - Math.abs(0.5 - r);
    this.colorRGB[2] = Math.abs(r - 1.5) - Math.abs(r - 1.0) + 0.5;
  }

  absorbParticle(particle: Particle) {
    this.deltaRadius += Math.PI / (circleSquare(this.radius));
    particle.state = 3;
  }

  mergeStar(other: Star) {
    this.radius = Math.sqrt(this.radius ** 2 + other.radius ** 2);
    other.state = 3;
  }
}