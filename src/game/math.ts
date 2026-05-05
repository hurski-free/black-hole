export type vec3 = [number, number, number];
export type vec2 = [number, number];

export function distance(x1: number, y1: number, x2: number, y2: number) {
  return Math.hypot(x1 - x2, y1 - y2);
}

export function distanceByDelta(deltaX: number, deltaY: number) {
  return Math.hypot(deltaX, deltaY);
}

export function random(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

export function circleSquare(radius: number) {
  return Math.PI * radius * radius;
}

export const PI_MUL_2 = 2 * Math.PI;
export const PI_DIV_2 = Math.PI / 2;
