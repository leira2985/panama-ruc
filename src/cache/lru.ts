/**
 * Cache LRU (Least Recently Used) simple para resultados de cálculo.
 *
 * Implementación basada en Map (que mantiene orden de inserción en JS).
 * Es la forma más rápida de hacer LRU en JS sin librerías externas.
 */

export class LruCache<K, V> {
  private readonly cache = new Map<K, V>();
  private readonly maxSize: number;

  constructor(maxSize = 1000) {
    if (maxSize < 1) {
      throw new Error("LRU cache size must be at least 1");
    }
    this.maxSize = maxSize;
  }

  get(key: K): V | undefined {
    const value = this.cache.get(key);
    if (value !== undefined) {
      // Re-insertar para marcar como "recientemente usado"
      this.cache.delete(key);
      this.cache.set(key, value);
    }
    return value;
  }

  set(key: K, value: V): void {
    // Si ya existe, eliminarlo para reinsertar al final
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxSize) {
      // Si está lleno, eliminar el primero (LRU)
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) {
        this.cache.delete(firstKey);
      }
    }
    this.cache.set(key, value);
  }

  has(key: K): boolean {
    return this.cache.has(key);
  }

  clear(): void {
    this.cache.clear();
  }

  get size(): number {
    return this.cache.size;
  }
}
