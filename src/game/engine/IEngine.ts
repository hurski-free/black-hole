import type { Game } from "../Game";

export interface IEngine<BH, S, P> {
  process(game: Game<BH, S, P>): void;
}