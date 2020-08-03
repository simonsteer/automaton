import range from 'lodash/range'
import { Constraint } from './types'
import Coords from '../Coords'

export default class RangeConstraint {
  constraint: Constraint
  offsets: {
    x: Set<number>
    y: Set<number>
  }

  constructor(constraint: Constraint) {
    this.constraint = constraint
    this.offsets = this.buildRangeSets()
  }
  /**
   * determines whether the distance between two coordinates matches the constraint
   */
  applies = (coordsA: Coords, coordsB: Coords) => {
    const deltas = coordsA.deltas(coordsB)
    return Object.values(this.validations).every(validate => validate(deltas))
  }
  /**
   * get coordinates considered adjacent to the coordinates passed in
   */
  adjacent(coordsA: Coords) {
    const adjacentCoords: Coords[] = []
    for (const xOffset of this.offsets.x) {
      for (const yOffset of this.offsets.y) {
        const coordsB = {
          x: coordsA.x + xOffset,
          y: coordsA.y + yOffset,
        }
        const deltas = coordsA.deltas(coordsB)
        if (this.validations.exceptions(deltas)) {
          adjacentCoords.push(new Coords(coordsB))
        }
      }
    }
    return adjacentCoords
  }
  /**
   * validations to run on deltas
   */
  private validations = {
    offsets: (deltas: Coords) =>
      this.offsets.x.has(deltas.x) && this.offsets.y.has(deltas.y),
    exceptions: (deltas: Coords) =>
      this.constraint.exceptions?.every(e => e(deltas)) ?? true,
  }

  private buildRangeSets() {
    return (['x', 'y'] as const).reduce(
      (acc, key) => {
        this.constraint.offsets[key].forEach(offset => {
          const offsetRange = Array.isArray(offset)
            ? range(offset[0], offset[1] + 1)
            : [offset]

          offsetRange.forEach(value =>
            acc[key as keyof Constraint['offsets']].add(value)
          )
        })
        return acc
      },
      { x: new Set<number>(), y: new Set<number>() }
    )
  }
}
