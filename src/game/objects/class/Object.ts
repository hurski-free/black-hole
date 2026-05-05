import { COMMON_GRAVITATIONAL_CONSTANT } from "../const";

/**
 * states:
 * 
 * free - object is not in the game
 * new - object is new in the game, will processed in next tick
 * exist - object is in the game, processed
 * deleted - object is deleted from the game, will be removed in next tick
 */
export type ObjectState = 'free' | 'new' | 'exist' | 'deleted';

export class Object {
  state: ObjectState = 'free';

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

    this.state = 'exist';
  }

  /**
   * Use it after force set radius
   */
  computeImpactingMass() {
    this.computedImpactingMass = this.radius * this.objectGravityCoefficient * COMMON_GRAVITATIONAL_CONSTANT;
  }
}