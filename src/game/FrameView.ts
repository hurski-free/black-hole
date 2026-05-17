import type { GameState } from "./Game";
import type { vec2 } from "./math";

export interface IFrameView {
  width: number;
  height: number;

  halfWidth: number;
  halfHeight: number;

  camera: vec2;

  gameState: GameState;

  score: number;
  particlesAbsorbedByBlackHoles: number;

  blackHoleTimeRemains: number;
}

export type ImmutableFrameView = Readonly<IFrameView>;
