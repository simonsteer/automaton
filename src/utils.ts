import { Tile } from './entities'

export function createSimpleGraph(size: number) {
  const tile = new Tile()
  return Array(size)
    .fill(tile)
    .map(t => Array(size).fill(t)) as Tile[][]
}

export function cache<F extends (...args: any) => any>(
  target: F,
  hashingMethod: (...args: Parameters<F>) => string,
  cacheLimit = 10
) {
  const cache = new Map<string, ReturnType<F>>()
  const relevancy: string[] = []

  const proxy = (new Proxy(target, {
    apply(target, thisArg, argumentsList) {
      const hash = hashingMethod(...argumentsList)

      let data = cache.get(hash)
      if (data) {
        const index = relevancy.indexOf(hash)
        relevancy.splice(index, 1)
      } else {
        if (cache.size === cacheLimit) {
          const leastRelevant = relevancy[relevancy.length - 1]
          cache.delete(leastRelevant)
          relevancy.splice(cacheLimit - 1)
        }
        const value = target(...argumentsList)
        cache.set(hash, value)
      }

      relevancy.unshift(hash)
      return cache.get(hash)!
    },
  }) as unknown) as F & {
    cache: Map<string, ReturnType<F>>
    relevancy: string[]
  }

  proxy.cache = cache
  proxy.relevancy = relevancy

  return proxy
}
