export interface IWorld {
  clear(): void;
  freeMemory(): void;
}

export interface IWorldCreateConfig {
  blackHolePoolCapacity: number;
  starPoolCapacity: number;
  particlePoolCapacity: number;
}