import { difference, union, intersect } from './utils'

describe('RangeConstraint/utils', () => {
  describe('difference', () => {
    it('can get the unique differences between two or more arrays', () => {
      const numbers = difference([1, 2, 3], [2, 3, 4], [3, 4, 5])
      const strings = difference(
        ['1', '2', '3'],
        ['2', '3', '4'],
        ['3', '4', '5']
      )
      const a = { a: 1 },
        b = { b: 2 },
        c = { c: 3 },
        d = { d: 4 },
        e = { e: 5 }
      const objects = difference(
        [a, b, c] as { [key: string]: number }[],
        [b, c, d] as { [key: string]: number }[],
        [c, d, e] as { [key: string]: number }[]
      )

      expect(numbers).toEqual([1, 5])
      expect(strings).toEqual(['1', '5'])
      expect(objects).toEqual([a, e])
    })
  })

  describe('union', () => {
    it('can get the unique union of two or more arrays', () => {
      const numbers = union([1, 2, 3], [2, 3, 4], [3, 4, 5])
      const strings = union(['1', '2', '3'], ['2', '3', '4'], ['3', '4', '5'])
      const a = { a: 1 },
        b = { b: 2 },
        c = { c: 3 },
        d = { d: 4 },
        e = { e: 5 }
      const objects = union(
        [a, b, c] as { [key: string]: number }[],
        [b, c, d] as { [key: string]: number }[],
        [c, d, e] as { [key: string]: number }[]
      )

      expect(numbers).toEqual([1, 2, 3, 4, 5])
      expect(strings).toEqual(['1', '2', '3', '4', '5'])
      expect(objects).toEqual([a, b, c, d, e])
    })
  })

  describe('intersect', () => {
    it('can get the unique intersection of two or more arrays', () => {
      const numbers = intersect([1, 2, 3], [2, 3, 4], [3, 4, 5])
      const strings = intersect(
        ['1', '2', '3'],
        ['2', '3', '4'],
        ['3', '4', '5']
      )
      const a = { a: 1 },
        b = { b: 2 },
        c = { c: 3 },
        d = { d: 4 },
        e = { e: 5 }
      const objects = intersect(
        [a, b, c] as { [key: string]: number }[],
        [b, c, d] as { [key: string]: number }[],
        [c, d, e] as { [key: string]: number }[]
      )

      expect(numbers).toEqual([3])
      expect(strings).toEqual(['3'])
      expect(objects).toEqual([c])
    })
  })
})
