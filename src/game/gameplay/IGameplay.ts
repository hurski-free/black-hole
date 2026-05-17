import type { IFrameView } from "../FrameView";
import type { GameWorld } from "../world";

export interface IGameplay<W extends GameWorld> {
  initStartData(world: W, frameView: IFrameView): void;
  tryBlackHoleAppear(world: W, frameView: IFrameView): void;
  hoverStar(world: W, frameView: IFrameView, mouseX: number, mouseY: number): void;
  moveToStar(world: W, frameView: IFrameView): void;
  moveToBlackHole(world: W, frameView: IFrameView): void;
}
