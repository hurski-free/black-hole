import type { ImmutableFrameView } from "../FrameView";
import type { IGameSession } from "../GameSession";
import type { GameWorld } from "../world";

export interface IGameplay<W extends GameWorld> {
  initStartData(world: W, frameView: ImmutableFrameView, gameSession: IGameSession): void;
  tryBlackHoleAppear(world: W, frameView: ImmutableFrameView, gameSession: IGameSession): void;
  hoverStar(world: W, frameView: ImmutableFrameView, mouseX: number, mouseY: number): void;
  moveToStar(world: W, frameView: ImmutableFrameView): void;
  moveToBlackHole(world: W, frameView: ImmutableFrameView): void;
}
