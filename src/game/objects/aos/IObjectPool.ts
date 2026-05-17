export interface IObjectPool<T> {
  get activeCount(): number;

  /**
   * Get all objects in the pool
   * 
   * @returns all objects in the pool
   */
  getArray(): Readonly<T[]>;

  /**
   * Throws an error if the index is out of bounds
   * 
   * @param index - index of the object in the pool
   * @returns the object at the given index
   */
  at(index: number): T;

  /**
   * Get a new object from the pool and set in to new state
   * 
   * @returns the new object
   */
  getNewObject(): T;

  /**
   * Swap and pop algorithm to avoid defragmentation
   */
  swapAndPop(): void;

  /**
   * Clear the pool and set all objects to free state
   */
  clear(): void;

  /**
   * Free the pool and set it to null
   */
  freeMemory(): void;
}