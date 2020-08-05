import { difference, union, intersect } from './utils'
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
    b: { a: terrain, c: terrain },
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
        b: { c: terrain },
      })
      expect(difference(map1, map2, map3)).toEqual({
        a: { c: terrain },
        b: { c: terrain, d: terrain },
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
        b: { c: terrain, d: terrain },
        d: { a: terrain },
        e: { a: terrain },
      })
    })
  })

  describe('union', () => {
    it('can get the union between two or more GraphNodeMaps', () => {
      expect(union(map1)).toEqual(map1)
      expect(union(map1, map2)).toEqual({
        a: { b: terrain },
        b: { a: terrain, c: terrain },
        c: { a: terrain },
      })
      expect(union(map1, map2, map3)).toEqual({
        a: { b: terrain, c: terrain },
        b: { a: terrain, c: terrain, d: terrain },
        c: { a: terrain },
        d: { a: terrain },
        e: { a: terrain },
      })
      expect(union(map1, map3)).toEqual({
        a: { b: terrain, c: terrain },
        b: { a: terrain, d: terrain },
        c: { a: terrain },
        d: { a: terrain },
        e: { a: terrain },
      })
      expect(union(map2, map3)).toEqual({
        a: { b: terrain, c: terrain },
        b: { a: terrain, c: terrain, d: terrain },
        c: { a: terrain },
        d: { a: terrain },
        e: { a: terrain },
      })
    })
  })

  describe('intersect', () => {
    it('can get the intersection between two or more GraphNodeMaps', () => {
      expect(intersect(map1)).toEqual(map1)
      expect(intersect(map1, map2)).toEqual({
        a: { b: terrain },
        b: { a: terrain },
      })
      expect(intersect(map1, map2, map3)).toEqual({
        a: { b: terrain },
        b: { a: terrain },
      })
      expect(intersect(map1, map3)).toEqual({
        a: { b: terrain },
        b: { a: terrain },
      })
      expect(intersect(map2, map3)).toEqual({
        a: { b: terrain },
        b: { a: terrain },
        c: { a: terrain },
      })
    })
  })
})
