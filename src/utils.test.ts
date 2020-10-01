import { SimpleCache } from './utils'

describe('SimpleCache', () => {
  const createCachedSumFn = () =>
    new SimpleCache(
      (...args: number[]) => args.reduce((acc, n) => acc + n, 0),
      (...args) => args.sort().map(String).join(),
      3
    )

  it('returns the same values as the original function', () => {
    const cachedSum = createCachedSumFn()

    const cachedResult = cachedSum.fn(1, 2, 3, 4, 5)
    const uncachedResult = cachedSum.target(1, 2, 3, 4, 5)

    expect(cachedResult).toBe(uncachedResult)
  })

  it('caches', () => {
    const cachedSum = createCachedSumFn()

    cachedSum.fn(1, 2, 3, 4, 5)
    cachedSum.fn(5, 4, 3, 2, 1)
    cachedSum.fn(2, 3, 4, 5, 1)
    cachedSum.fn(1, 3, 2, 4, 5)
    cachedSum.fn(3, 4, 5, 2, 1)

    expect(cachedSum.cache.size).toBe(1)
    expect(cachedSum.relevancy.length).toBe(1)
  })

  describe('hitting the cache size limit', () => {
    const cachedSum = createCachedSumFn()

    cachedSum.fn(1)
    cachedSum.fn(1, 2)
    cachedSum.fn(1, 2, 3)
    cachedSum.fn(1, 2, 3, 4)
    cachedSum.fn(1, 2, 3, 4, 5)

    it('respects the cache size limit', () => {
      expect(cachedSum.cache.size).toBe(3)
    })

    it('clears cache entries based on order of first access', () => {
      expect(cachedSum.relevancy).toEqual(['1,2,3,4,5', '1,2,3,4', '1,2,3'])
    })
  })
})
