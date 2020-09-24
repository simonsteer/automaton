import { mergeCoordinates, mergeGraphs } from './utils'
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
        expect(mergeGraphs('difference', map1)).toEqual(map1)
        expect(mergeGraphs('difference', map1, map2)).toEqual({
          c: { a: tile },
          b: { c: tile },
        })
        expect(mergeGraphs('difference', map1, map2, map3)).toEqual({
          a: { c: tile },
          b: { c: tile, d: tile },
          d: { a: tile },
          e: { a: tile },
        })
        expect(mergeGraphs('difference', map1, map3)).toEqual({
          a: { c: tile },
          b: { d: tile },
          c: { a: tile },
          d: { a: tile },
          e: { a: tile },
        })
        expect(mergeGraphs('difference', map2, map3)).toEqual({
          a: { c: tile },
          b: { c: tile, d: tile },
          d: { a: tile },
          e: { a: tile },
        })
      })
    })

    describe('union', () => {
      it('can get the union between two or more GraphNodeMaps', () => {
        expect(mergeGraphs('union', map1)).toEqual(map1)
        expect(mergeGraphs('union', map1, map2)).toEqual({
          a: { b: tile },
          b: { a: tile, c: tile },
          c: { a: tile },
        })
        expect(mergeGraphs('union', map1, map2, map3)).toEqual({
          a: { b: tile, c: tile },
          b: { a: tile, c: tile, d: tile },
          c: { a: tile },
          d: { a: tile },
          e: { a: tile },
        })
        expect(mergeGraphs('union', map1, map3)).toEqual({
          a: { b: tile, c: tile },
          b: { a: tile, d: tile },
          c: { a: tile },
          d: { a: tile },
          e: { a: tile },
        })
        expect(mergeGraphs('union', map2, map3)).toEqual({
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
        expect(mergeGraphs('intersect', map1)).toEqual(map1)
        expect(mergeGraphs('intersect', map1, map2)).toEqual({
          a: { b: tile },
          b: { a: tile },
        })
        expect(mergeGraphs('intersect', map1, map2, map3)).toEqual({
          a: { b: tile },
          b: { a: tile },
        })
        expect(mergeGraphs('intersect', map1, map3)).toEqual({
          a: { b: tile },
          b: { a: tile },
        })
        expect(mergeGraphs('intersect', map2, map3)).toEqual({
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
    ]
    const reachable2 = [
      { x: 3, y: 6 },
      { x: 4, y: 7 },
    ]
    const reachable3 = [
      { x: 1, y: 2 },
      { x: 4, y: 7 },
    ]

    describe('difference', () => {
      it('can get the difference between two or more sets of coordinates', () => {
        expect(
          mergeCoordinates('difference', reachable1).map(coords => coords.raw)
        ).toEqual(reachable1)
        expect(
          mergeCoordinates('difference', reachable1, reachable2).map(
            coords => coords.raw
          )
        ).toEqual([
          { x: 1, y: 2 },
          { x: 2, y: 4 },
          { x: 4, y: 7 },
        ])
        expect(
          mergeCoordinates(
            'difference',
            reachable1,
            reachable2,
            reachable3
          ).map(coords => coords.raw)
        ).toEqual([{ x: 2, y: 4 }])
      })
    })

    describe('union', () => {
      it('can get the union between two or more sets of coordinates', () => {
        expect(
          mergeCoordinates('union', reachable1).map(coords => coords.raw)
        ).toEqual(reachable1)
        expect(
          mergeCoordinates('union', reachable1, reachable2).map(
            coords => coords.raw
          )
        ).toEqual([
          { x: 1, y: 2 },
          { x: 2, y: 4 },
          { x: 3, y: 6 },
          { x: 4, y: 7 },
        ])
        expect(
          mergeCoordinates('union', reachable1, reachable2, reachable3).map(
            coords => coords.raw
          )
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
          mergeCoordinates('intersect', reachable1).map(coords => coords.raw)
        ).toEqual(reachable1)
        expect(
          mergeCoordinates('intersect', reachable1, reachable2).map(
            coords => coords.raw
          )
        ).toEqual([{ x: 3, y: 6 }])
        expect(
          mergeCoordinates('intersect', reachable1, reachable2, reachable3).map(
            coords => coords.raw
          )
        ).toEqual([])
      })
    })
  })
})
