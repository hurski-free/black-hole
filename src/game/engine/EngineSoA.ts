import type { IEngine } from "./IEngine";
import type { IFrameView } from "../FrameView";
import type { SoAWorld } from "../world/SoAWorld";

// TODO: Implement EngineSoA
export class EngineSoA implements IEngine<SoAWorld> {
  process(world: SoAWorld, frameView: IFrameView): void {
    void world;
    void frameView;
  }
}