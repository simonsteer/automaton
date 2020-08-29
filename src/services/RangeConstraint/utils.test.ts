import { graphMergeStrategies, coordinatesHashesMergeStrategies } from './utils'
import { GraphNodeMap } from '../Deployment/Dijkstra/types'
import { Coords } from '..'
import { Tile } from '../..'

describe('RangeConstraint/utils', () => {
  describe('GraphNodeMap merge strategies', () => {
    const tile = new Tile()
    const map1: GraphNodeMap = {
      a: { b: tile },
      b: { a: tile },
    }
    const map2: GraphNodeMap = {
      a: { b: tile },
      b: { a: tile, c: tile },
      c: { a: tile },
    }
    const map3: GraphNodeMap = {
      a: { b: tile, c: tile },
      b: { a: tile, d: tile },
      c: { a: tile },
      d: { a: tile },
      e: { a: tile },
    }

    describe('difference', () => {
      it('can get the difference between two or more GraphNodeMaps', () => {
        expect(graphMergeStrategies.difference(map1)).toEqual(map1)
        expect(graphMergeStrategies.difference(map1, map2)).toEqual({
          c: { a: tile },
          b: { c: tile },
        })
        expect(graphMergeStrategies.difference(map1, map2, map3)).toEqual({
          a: { c: tile },
          b: { c: tile, d: tile },
          d: { a: tile },
          e: { a: tile },
        })
        expect(graphMergeStrategies.difference(map1, map3)).toEqual({
          a: { c: tile },
          b: { d: tile },
          c: { a: tile },
          d: { a: tile },
          e: { a: tile },
        })
        expect(graphMergeStrategies.difference(map2, map3)).toEqual({
          a: { c: tile },
          b: { c: tile, d: tile },
          d: { a: tile },
          e: { a: tile },
        })
      })
    })

    describe('union', () => {
      it('can get the union between two or more GraphNodeMaps', () => {
        expect(graphMergeStrategies.union(map1)).toEqual(map1)
        expect(graphMergeStrategies.union(map1, map2)).toEqual({
          a: { b: tile },
          b: { a: tile, c: tile },
          c: { a: tile },
        })
        expect(graphMergeStrategies.union(map1, map2, map3)).toEqual({
          a: { b: tile, c: tile },
          b: { a: tile, c: tile, d: tile },
          c: { a: tile },
          d: { a: tile },
          e: { a: tile },
        })
        expect(graphMergeStrategies.union(map1, map3)).toEqual({
          a: { b: tile, c: tile },
          b: { a: tile, d: tile },
          c: { a: tile },
          d: { a: tile },
          e: { a: tile },
        })
        expect(graphMergeStrategies.union(map2, map3)).toEqual({
          a: { b: tile, c: tile },
          b: { a: tile, c: tile, d: tile },
          c: { a: tile },
          d: { a: tile },
          e: { a: tile },
        })
      })
    })

    describe('intersect', () => {
      it('can get the intersection between two or more GraphNodeMaps', () => {
        expect(graphMergeStrategies.intersect(map1)).toEqual(map1)
        expect(graphMergeStrategies.intersect(map1, map2)).toEqual({
          a: { b: tile },
          b: { a: tile },
        })
        expect(graphMergeStrategies.intersect(map1, map2, map3)).toEqual({
          a: { b: tile },
          b: { a: tile },
        })
        expect(graphMergeStrategies.intersect(map1, map3)).toEqual({
          a: { b: tile },
          b: { a: tile },
        })
        expect(graphMergeStrategies.intersect(map2, map3)).toEqual({
          a: { b: tile },
          b: { a: tile },
          c: { a: tile },
        })
      })
    })
  })

  describe('Reachable coordinates merge strategies', () => {
    const reachable1 = [
      { x: 1, y: 2 },
      { x: 2, y: 4 },
      { x: 3, y: 6 },
    ].map(Coords.hash)
    const reachable2 = [
      { x: 3, y: 6 },
      { x: 4, y: 7 },
    ].map(Coords.hash)
    const reachable3 = [
      { x: 1, y: 2 },
      { x: 4, y: 7 },
    ].map(Coords.hash)

    describe('difference', () => {
      it('can get the difference between two or more sets of coordinates', () => {
        expect(
          coordinatesHashesMergeStrategies
            .difference(reachable1)
            .map(coords => coords.raw)
        ).toEqual(reachable1.map(hash => Coords.parse(hash).raw))
        expect(
          coordinatesHashesMergeStrategies
            .difference(reachable1, reachable2)
            .map(coords => coords.raw)
        ).toEqual([
          { x: 1, y: 2 },
          { x: 2, y: 4 },
          { x: 4, y: 7 },
        ])
        expect(
          coordinatesHashesMergeStrategies
            .difference(reachable1, reachable2, reachable3)
            .map(coords => coords.raw)
        ).toEqual([{ x: 2, y: 4 }])
      })
    })

    describe('union', () => {
      it('can get the union between two or more sets of coordinates', () => {
        expect(
          coordinatesHashesMergeStrategies
            .union(reachable1)
            .map(coords => coords.raw)
        ).toEqual(reachable1.map(hash => Coords.parse(hash).raw))
        expect(
          coordinatesHashesMergeStrategies
            .union(reachable1, reachable2)
            .map(coords => coords.raw)
        ).toEqual([
          { x: 1, y: 2 },
          { x: 2, y: 4 },
          { x: 3, y: 6 },
          { x: 4, y: 7 },
        ])
        expect(
          coordinatesHashesMergeStrategies
            .union(reachable1, reachable2, reachable3)
            .map(coords => coords.raw)
        ).toEqual([
          { x: 1, y: 2 },
          { x: 2, y: 4 },
          { x: 3, y: 6 },
          { x: 4, y: 7 },
        ])
      })
    })

    describe('intersect', () => {
      it('can get the intersection between two or more sets of coordinates', () => {
        expect(
          coordinatesHashesMergeStrategies
            .intersect(reachable1)
            .map(coords => coords.raw)
        ).toEqual(reachable1.map(hash => Coords.parse(hash).raw))
        expect(
          coordinatesHashesMergeStrategies
            .intersect(reachable1, reachable2)
            .map(coords => coords.raw)
        ).toEqual([{ x: 3, y: 6 }])
        expect(
          coordinatesHashesMergeStrategies
            .intersect(reachable1, reachable2, reachable3)
            .map(coords => coords.raw)
        ).toEqual([])
      })
    })
  })
})
