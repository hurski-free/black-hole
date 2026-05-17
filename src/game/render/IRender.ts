import type { Translator } from "../../i18n";
import type { Game } from "../Game";

export interface IRender<BH, S, P> {
  readonly translator: Translator;

  render(ctx: Game<BH, S, P>): void;
}