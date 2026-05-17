import type { Translator } from "../../i18n";
import type { ImmutableFrameView } from "../FrameView";
import type { GameWorld } from "../world";

export interface IRender<W extends GameWorld> {
  readonly translator: Translator;
  render(world: W, frameView: ImmutableFrameView): void;
}