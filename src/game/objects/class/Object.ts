import { COMMON_GRAVITATIONAL_CONSTANT } from "../const";

/**
 * states:
 * 
 * 0 - free - object is not in the game
 * 
 * 1 - new - object is new in the game, will processed in next tick
 * 
 * 2 - exist - object is in the game, processed
 * 
 * 3 - deleted - object is deleted from the game, will be removed in next tick
 */
export type ObjectState = 0 | 1 | 2 | 3;

export class GameObject {
  /**
   * 0 - free - object is not in the game
   *
   * 
   * 1 - new - object is new in the game, will processed in next tick
   * 
   * 
   * 2 - exist - object is in the game, processed
   * 
   * 
   * 3 - deleted - object is deleted from the game, will be removed in next tick
   */
  state: ObjectState = 0;

  radius: number = 0;
  deltaRadius: number = 0;

  x: number = 0;
  y: number = 0;

  velocityX: number = 0;
  velocityY: number = 0;

  accelerationX: number = 0;
  accelerationY: number = 0;

  objectGravityCoefficient: number = 0;
  computedImpactingMass: number = 0;

  update() {
    this.velocityX += this.accelerationX;
    this.velocityY += this.accelerationY;

    this.x += this.velocityX;
    this.y += this.velocityY;

    this.radius += this.deltaRadius;
    this.deltaRadius = 0;
    this.computeImpactingMass();

    this.state = 2;
    this.accelerationX = 0;
    this.accelerationY = 0;
  }

  /**
   * Use it after force set radius
   */
  computeImpactingMass() {
    this.computedImpactingMass = this.radius * this.objectGravityCoefficient * COMMON_GRAVITATIONAL_CONSTANT;
  }
}