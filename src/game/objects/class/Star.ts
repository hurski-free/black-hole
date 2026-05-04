import type { vec3 } from "../../math";
import { STAR_MAX_MINUS_MIN, STAR_MIN_SIZE } from "../const";
import { Object } from "./Object";

export class Star extends Object {
  /**
   * 
   */
  colorRGB: vec3 = [0, 0, 0];

  update() {
    super.update();
    this.computeColorRGB();
  }

  private computeColorRGB() {
    let r = 2.0 * (this.radius - STAR_MIN_SIZE) / STAR_MAX_MINUS_MIN;

    this.colorRGB[0] = Math.abs(r - 0.5) - Math.abs(r - 1.0) + 0.5;
    this.colorRGB[1] = Math.abs(2.0 - r) - Math.abs(1.5 - r) + r - Math.abs(0.5 - r);
    this.colorRGB[2] = Math.abs(r - 1.5) - Math.abs(r - 1.0) + 0.5;
  }
}