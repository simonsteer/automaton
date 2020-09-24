import { cache } from './utils'

describe('cache', () => {
  const createSumFn = () =>
    cache(
      (...args: number[]) => args.reduce((acc, n) => acc + n, 0),
      (...args) => args.sort().map(String).join(','),
      3
    )

  it('caches', () => {
    const sum = createSumFn()

    sum(1, 2, 3, 4, 5)
    sum(5, 4, 3, 2, 1)
    sum(2, 3, 4, 5, 1)
    sum(1, 3, 2, 4, 5)
    sum(3, 4, 5, 2, 1)
    expect(sum.cache.size).toBe(1)
    expect(sum.relevancy.length).toBe(1)
  })

  describe('hitting the cache size limit', () => {
    const sum = createSumFn()
    sum(1)
    sum(1, 2)
    sum(1, 2, 3)
    sum(1, 2, 3, 4)
    sum(1, 2, 3, 4, 5)

    it('respects the cache size limit', () => {
      expect(sum.cache.size).toBe(3)
    })

    it('clears cache entries based on order of last access', () => {
      expect(sum.relevancy).toEqual(['1,2,3,4,5', '1,2,3,4', '1,2,3'])
    })
  })
})
