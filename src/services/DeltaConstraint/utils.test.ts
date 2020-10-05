import { merge_deltas } from './utils'

describe('DeltaConstraint/utils', () => {
  describe('merge_deltas', () => {
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
          merge_deltas('difference', reachable1).map(coords => coords.raw)
        ).toEqual(reachable1)
        expect(
          merge_deltas('difference', reachable1, reachable2).map(
            coords => coords.raw
          )
        ).toEqual([
          { x: 1, y: 2 },
          { x: 2, y: 4 },
          { x: 4, y: 7 },
        ])
        expect(
          merge_deltas('difference', reachable1, reachable2, reachable3).map(
            coords => coords.raw
          )
        ).toEqual([{ x: 2, y: 4 }])
      })
    })

    describe('union', () => {
      it('can get the union between two or more sets of coordinates', () => {
        expect(
          merge_deltas('union', reachable1).map(coords => coords.raw)
        ).toEqual(reachable1)
        expect(
          merge_deltas('union', reachable1, reachable2).map(
            coords => coords.raw
          )
        ).toEqual([
          { x: 1, y: 2 },
          { x: 2, y: 4 },
          { x: 3, y: 6 },
          { x: 4, y: 7 },
        ])
        expect(
          merge_deltas('union', reachable1, reachable2, reachable3).map(
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
          merge_deltas('intersect', reachable1).map(coords => coords.raw)
        ).toEqual(reachable1)
        expect(
          merge_deltas('intersect', reachable1, reachable2).map(
            coords => coords.raw
          )
        ).toEqual([{ x: 3, y: 6 }])
        expect(
          merge_deltas('intersect', reachable1, reachable2, reachable3).map(
            coords => coords.raw
          )
        ).toEqual([])
      })
    })
  })
})
