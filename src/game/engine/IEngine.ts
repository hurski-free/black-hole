import type { IFrameView } from "../FrameView";
import type { GameWorld } from "../world";

export interface IEngine<W extends GameWorld> {
  process(world: W, frameView: IFrameView): void;
}