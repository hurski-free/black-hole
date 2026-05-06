import type { GameObject } from "./Object";

export class ObjectPool<T extends GameObject> {
  private pool: T[] = [];

  private _capacity: number;
  private _active_count: number;

  constructor(capacity: number, create: () => T) {
    this._capacity = capacity;
    this._active_count = 0;

    for (let i = 0; i < capacity; i++) {
      this.pool.push(create());
    }
  }

  get activeCount(): number {
    return this._active_count;
  }

  getArray(): Readonly<T[]> {
    return this.pool;
  }

  at(index: number): T {
    if (index < 0 || index >= this._active_count) {
      throw new Error('Index out of bounds');
    }

    return this.pool[index];
  }

  getNewObject(): T {
    if (this._active_count >= this._capacity) {
      throw new Error('Object pool is full');
    }

    const i = this._active_count;
    this._active_count++;

    this.pool[i].state = 'new';

    return this.pool[i];
  }

  /**
   * Swap and pop algorithm to avoid defragmentation
   */
  swapAndPop() {
    let i = 0;

    while (i < this._active_count) {
      if (this.pool[i].state === 'deleted') {
        const lastIndex = this._active_count - 1;
        const deletedObject = this.pool[i];
        const lastObject = this.pool[lastIndex];

        this.pool[i] = lastObject;
        this.pool[lastIndex] = deletedObject;
        deletedObject.state = 'free';

        this._active_count--;
      } else {
        i++;
      }
    }
  }

  update() {
    for (let i = 0; i < this._active_count; i++) {
      this.pool[i].update();
    }
  }

  clear() {
    for (let i = 0; i < this._active_count; i++) {
      this.pool[i].state = 'free';
    }
    this._active_count = 0;
  }

  free() {
    (this.pool as unknown) = null;
    this._capacity = 0;
    this._active_count = 0;
  }
}