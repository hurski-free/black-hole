export interface IObjectPool<T> {
  get activeCount(): number;

  /**
   * Get all objects in the pool
   * 
   * WARN: method only for pool of classes, not for SoA
   * 
   * @returns all objects in the pool
   */
  getArray(): Readonly<T[]>;

  /**
   * Throws an error if the index is out of bounds
   * 
   * WARN: method only for pool of classes, not for SoA
   * 
   * @param index - index of the object in the pool
   * @returns the object at the given index
   */
  at(index: number): T;

  /**
   * Get a new object from the pool and set in to new state
   * 
   * WARN: For SoA return index of the elements
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
  free(): void;
}