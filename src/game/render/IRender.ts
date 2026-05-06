import type { Game } from "../Game";

export interface IRender<BH, S, P> {
  render(ctx: Game<BH, S, P>): void;
}