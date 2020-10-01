import { Tile } from './entities'

export function createSimpleGraph(size: number) {
  const tile = new Tile()
  return Array(size)
    .fill(tile)
    .map(t => Array(size).fill(t)) as Tile[][]
}

export class SimpleCache<F extends (...args: any) => any> {
  target: F
  fn: F
  cache = new Map<string, ReturnType<F>>()
  relevancy: string[] = []
  cacheSize: number
  hashingMethod: (...args: Parameters<F>) => string

  constructor(
    fn: F,
    hashingMethod: (...args: Parameters<F>) => string,
    cacheSize = 100
  ) {
    const self = this

    this.cacheSize = cacheSize
    this.hashingMethod = hashingMethod
    this.target = fn
    this.fn = new Proxy(fn, {
      apply(target, thisArg, argumentsList) {
        const hash = self.hashingMethod(...argumentsList)

        let data = self.cache.get(hash)
        if (data) {
          const index = self.relevancy.indexOf(hash)
          self.relevancy.splice(index, 1)
        } else {
          if (self.cache.size === self.cacheSize) {
            const leastRelevant = self.relevancy[self.relevancy.length - 1]
            self.cache.delete(leastRelevant)
            self.relevancy.splice(self.cacheSize - 1)
          }
          data = target(...argumentsList)
          self.cache.set(hash, data as ReturnType<F>)
        }

        self.relevancy.unshift(hash)
        return data!
      },
    })
  }
}

export * from './services/DeltaConstraint/utils'
