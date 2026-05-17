import type { IEngine } from "./IEngine";
import type { IFrameView } from "../FrameView";
import type { SoAWorld } from "../world/SoAWorld";
import type { IGameSession } from "../GameSession";

// TODO: Implement EngineSoA
export class EngineSoA implements IEngine<SoAWorld> {
  process(world: SoAWorld, frameView: IFrameView, gameSession: IGameSession): void {
    void world;
    void frameView;
    void gameSession;
  }
}