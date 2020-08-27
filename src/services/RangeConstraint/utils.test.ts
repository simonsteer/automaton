import { graphMergeStrategies, coordinatesHashesMergeStrategies } from './utils'
import { GraphNodeMap } from '../Deployment/Dijkstra/types'
import Terrain from '../../entities/Terrain'
import { Coords } from '..'

describe('RangeConstraint/utils', () => {
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
        expect(graphMergeStrategies.difference(map1)).toEqual(map1)
        expect(graphMergeStrategies.difference(map1, map2)).toEqual({
          c: { a: terrain },
          b: { c: terrain },
        })
        expect(graphMergeStrategies.difference(map1, map2, map3)).toEqual({
          a: { c: terrain },
          b: { c: terrain, d: terrain },
          d: { a: terrain },
          e: { a: terrain },
        })
        expect(graphMergeStrategies.difference(map1, map3)).toEqual({
          a: { c: terrain },
          b: { d: terrain },
          c: { a: terrain },
          d: { a: terrain },
          e: { a: terrain },
        })
        expect(graphMergeStrategies.difference(map2, map3)).toEqual({
          a: { c: terrain },
          b: { c: terrain, d: terrain },
          d: { a: terrain },
          e: { a: terrain },
        })
      })
    })

    describe('union', () => {
      it('can get the union between two or more GraphNodeMaps', () => {
        expect(graphMergeStrategies.union(map1)).toEqual(map1)
        expect(graphMergeStrategies.union(map1, map2)).toEqual({
          a: { b: terrain },
          b: { a: terrain, c: terrain },
          c: { a: terrain },
        })
        expect(graphMergeStrategies.union(map1, map2, map3)).toEqual({
          a: { b: terrain, c: terrain },
          b: { a: terrain, c: terrain, d: terrain },
          c: { a: terrain },
          d: { a: terrain },
          e: { a: terrain },
        })
        expect(graphMergeStrategies.union(map1, map3)).toEqual({
          a: { b: terrain, c: terrain },
          b: { a: terrain, d: terrain },
          c: { a: terrain },
          d: { a: terrain },
          e: { a: terrain },
        })
        expect(graphMergeStrategies.union(map2, map3)).toEqual({
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
        expect(graphMergeStrategies.intersect(map1)).toEqual(map1)
        expect(graphMergeStrategies.intersect(map1, map2)).toEqual({
          a: { b: terrain },
          b: { a: terrain },
        })
        expect(graphMergeStrategies.intersect(map1, map2, map3)).toEqual({
          a: { b: terrain },
          b: { a: terrain },
        })
        expect(graphMergeStrategies.intersect(map1, map3)).toEqual({
          a: { b: terrain },
          b: { a: terrain },
        })
        expect(graphMergeStrategies.intersect(map2, map3)).toEqual({
          a: { b: terrain },
          b: { a: terrain },
          c: { a: terrain },
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
