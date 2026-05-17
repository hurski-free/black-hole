import { BlackHole } from "../objects/aos/BlackHole";
import { ObjectPool } from "../objects/aos/ObjectPool";
import { Particle } from "../objects/aos/Particle";
import { Star } from "../objects/aos/Star";
import type { IWorld, IWorldCreateConfig } from "./IWorld";

export class AoSWorld implements IWorld {
  readonly blackHoles: ObjectPool<BlackHole>;
  readonly stars: ObjectPool<Star>;
  readonly particles: ObjectPool<Particle>;

  constructor(cfg: IWorldCreateConfig) {
    this.blackHoles = new ObjectPool<BlackHole>(cfg.blackHolePoolCapacity, () => new BlackHole());
    this.stars = new ObjectPool<Star>(cfg.starPoolCapacity, () => new Star());
    this.particles = new ObjectPool<Particle>(cfg.particlePoolCapacity, () => new Particle());
  }

  clear(): void {
    this.blackHoles.clear();
    this.stars.clear();
    this.particles.clear();
  }

  freeMemory(): void {
    this.blackHoles.freeMemory();
    this.stars.freeMemory();
    this.particles.freeMemory();
  }
}