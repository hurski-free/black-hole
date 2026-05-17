import type { IObjectPool } from "./IObjectPool";
import { OBJ_STATE_DELETED, OBJ_STATE_FREE, OBJ_STATE_NEW, type GameObject } from "./Object";

export class ObjectPool<T extends GameObject> implements IObjectPool<T> {
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

    this.pool[i].state = OBJ_STATE_NEW;

    return this.pool[i];
  }

  /**
   * Swap and pop algorithm to avoid defragmentation
   */
  swapAndPop() {
    let i = 0;

    while (i < this._activeCount) {
      if (this.pool[i].state === OBJ_STATE_DELETED) {
        const lastIndex = this._activeCount - 1;
        const deletedObject = this.pool[i];
        const lastObject = this.pool[lastIndex];

        this.pool[i] = lastObject;
        this.pool[lastIndex] = deletedObject;
        deletedObject.state = OBJ_STATE_FREE;

        this._activeCount--;
      } else {
        i++;
      }
    }
  }

  clear() {
    for (let i = 0; i < this._activeCount; i++) {
      this.pool[i].state = OBJ_STATE_FREE;
    }
    this._activeCount = 0;
  }

  freeMemory() {
    (this.pool as unknown) = null;
    this._capacity = 0;
    this._activeCount = 0;
  }
}