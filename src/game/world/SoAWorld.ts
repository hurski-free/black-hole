import { BufferSoAPool } from "../objects/soa/BufferSoAPool";
import type { IWorld, IWorldCreateConfig } from "./IWorld";

export class SoAWorld implements IWorld {
  readonly blackHolesPool: BufferSoAPool;
  readonly starsPool: BufferSoAPool;
  readonly particlesPool: BufferSoAPool;

  constructor(cfg: IWorldCreateConfig) {
    this.blackHolesPool = new BufferSoAPool(cfg.blackHolePoolCapacity);
    this.starsPool = new BufferSoAPool(cfg.starPoolCapacity);
    this.particlesPool = new BufferSoAPool(cfg.particlePoolCapacity);

    // TODO: add create array buffers for black holes, stars and particles
  }

  clear(): void {
    this.blackHolesPool.clearObjects();
    this.starsPool.clearObjects();
    this.particlesPool.clearObjects();
  }

  freeMemory(): void {
    this.blackHolesPool.freeMemory();
    this.starsPool.freeMemory();
    this.particlesPool.freeMemory();
  }
}