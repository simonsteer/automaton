import range from 'lodash/range'
import { RangeConstraintConfig } from './types'
import Coords from '../Coords'

export default class RangeConstraint {
  constraints: RangeConstraintConfig[]
  constructor(...constraints: RangeConstraintConfig[]) {
    this.constraints = constraints
  }

  /**
   * get coordinates considered adjacent to the coordinates passed in
   */
  adjacent(coordsA: Coords) {
    const adjacentCoords: Coords[] = []
    this.constraints.forEach(constraint => {
      const offsets = this.buildRangeSet(constraint)

      for (const xOffset of offsets.x) {
        for (const yOffset of offsets.y) {
          const coordsB = {
            x: coordsA.x + xOffset,
            y: coordsA.y + yOffset,
          }
          const deltas = coordsA.deltas(coordsB)
          if (
            !constraint.exceptions ||
            constraint.exceptions.every(exception => exception(deltas))
          ) {
            adjacentCoords.push(new Coords(coordsB))
          }
        }
      }
    })
    return adjacentCoords
  }

  private buildRangeSet = ({ offsets }: RangeConstraintConfig) =>
    (['x', 'y'] as const).reduce(
      (acc, key) => {
        offsets[key].forEach(offset => {
          const offsetRange = Array.isArray(offset)
            ? range(offset[0], offset[1] + 1)
            : [offset]

          offsetRange.forEach(value =>
            acc[key as keyof RangeConstraintConfig['offsets']].add(value)
          )
        })
        return acc
      },
      { x: new Set<number>(), y: new Set<number>() }
    )
}
