import type { GameObject } from "./Object";

export class ObjectPool<T extends GameObject> {
  private pool: T[] = [];

  private _capacity: number;
  private _activeCount: number;

  constructor(capacity: number, create: () => T) {
    this._capacity = capacity;
    this._activeCount = 0;

    for (let i = 0; i < capacity; i++) {
      this.pool.push(create());
    }
  }

  get activeCount(): number {
    return this._activeCount;
  }

  getArray(): Readonly<T[]> {
    return this.pool;
  }

  at(index: number): T {
    if (index < 0 || index >= this._activeCount) {
      throw new Error('Index out of bounds');
    }

    return this.pool[index];
  }

  getNewObject(): T {
    if (this._activeCount >= this._capacity) {
      throw new Error('Object pool is full');
    }

    const i = this._activeCount;
    this._activeCount++;

    this.pool[i].state = 1;

    return this.pool[i];
  }

  /**
   * Swap and pop algorithm to avoid defragmentation
   */
  swapAndPop() {
    let i = 0;

    while (i < this._activeCount) {
      if (this.pool[i].state === 3) {
        const lastIndex = this._activeCount - 1;
        const deletedObject = this.pool[i];
        const lastObject = this.pool[lastIndex];

        this.pool[i] = lastObject;
        this.pool[lastIndex] = deletedObject;
        deletedObject.state = 0;

        this._activeCount--;
      } else {
        i++;
      }
    }
  }

  update() {
    for (let i = 0; i < this._activeCount; i++) {
      this.pool[i].update();
    }
  }

  clear() {
    for (let i = 0; i < this._activeCount; i++) {
      this.pool[i].state = 0;
    }
    this._activeCount = 0;
  }

  free() {
    (this.pool as unknown) = null;
    this._capacity = 0;
    this._activeCount = 0;
  }
}