import { GRAVITATIONAL_CONSTANT } from "../const";

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

  private _mass: number = 0;
  computedImpactingMass: number = 0;


  set mass(value: number) {
    this._mass = value;
    this.computedImpactingMass = value * GRAVITATIONAL_CONSTANT;
  }

  get mass(): number {
    return this._mass;
  }

  update() {
    this.velocityX += this.accelerationX;
    this.velocityY += this.accelerationY;

    this.x += this.velocityX;
    this.y += this.velocityY;

    this.radius += this.deltaRadius;
  }
}