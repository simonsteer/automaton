import Tile from 'entities/Tile'

export function memoize<F extends (...args: any) => any>(
  fn: F,
  hashing_method: (...args: Parameters<F>) => string,
  cache_size = 100
) {
  const relevancy: string[] = []
  const cache = new Map<string, ReturnType<F>>()

  return new Proxy(fn, {
    apply(target, _, args) {
      const hash = hashing_method(...args)

      let data = cache.get(hash)
      if (data) {
        const index = relevancy.indexOf(hash)
        relevancy.splice(index, 1)
      } else {
        if (cache.size === cache_size) {
          const leastRelevant = relevancy[relevancy.length - 1]
          cache.delete(leastRelevant)
          relevancy.splice(cache_size - 1)
        }
        data = target(...args)
        cache.set(hash, data as ReturnType<F>)
      }

      relevancy.unshift(hash)
      return data!
    },
  })
}

export function create_simple_tileset(tile: typeof Tile, size: number) {
  return Array(size)
    .fill(null)
    .map(() =>
      Array(size)
        .fill(null)
        .map(() => new tile())
    )
}
