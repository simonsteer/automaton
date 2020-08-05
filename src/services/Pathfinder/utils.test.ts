import { difference, union } from './utils'
import { GraphNodeMap } from './Dijkstra/types'
import { Terrain } from '../../entities'

describe('GraphNodeMap merge strategies', () => {
  const terrain = new Terrain()
  const map1: GraphNodeMap = {
    a: { b: terrain },
    b: { a: terrain },
  }
  const map2: GraphNodeMap = {
    a: { b: terrain },
    b: { a: terrain, d: terrain },
    c: { a: terrain },
  }
  const map3: GraphNodeMap = {
    a: { b: terrain, c: terrain },
    b: { a: terrain, d: terrain },
    c: { a: terrain },
    d: { a: terrain },
    e: { a: terrain },
  }

  describe('difference', () => {
    it('can get the difference between two or more GraphNodeMaps', () => {
      expect(difference(map1)).toEqual(map1)
      expect(difference(map1, map2)).toEqual({
        c: { a: terrain },
        b: { d: terrain },
      })
      expect(difference(map1, map2, map3)).toEqual({
        a: { c: terrain },
        d: { a: terrain },
        e: { a: terrain },
      })
      expect(difference(map1, map3)).toEqual({
        a: { c: terrain },
        b: { d: terrain },
        c: { a: terrain },
        d: { a: terrain },
        e: { a: terrain },
      })
      expect(difference(map2, map3)).toEqual({
        a: { c: terrain },
        d: { a: terrain },
        e: { a: terrain },
      })
    })
  })
})
