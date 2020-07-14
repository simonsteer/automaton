import range from 'lodash/range'
import { Constraint } from './types'
import Coords from '../Coords'

export default class DirectionalConstraint {
  constraint: Constraint
  rangeSets: {
    x: Set<number>
    y: Set<number>
  }

  constructor(constraint: Constraint) {
    this.constraint = constraint
    this.rangeSets = this.buildRangeSets()
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
    const adjacentCoords: RawCoords[] = []
    for (const xOffset of this.rangeSets.x) {
      for (const yOffset of this.rangeSets.y) {
        const coordsB = {
          x: coordsA.x + xOffset,
          y: coordsA.y + yOffset,
        }
        if (this.validations.exceptions(coordsA.deltas(coordsB))) {
          adjacentCoords.push(coordsB)
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
      this.rangeSets.x.has(deltas.x) && this.rangeSets.y.has(deltas.y),
    exceptions: (deltas: Coords) =>
      this.constraint.exceptions?.every(e => e(deltas)) ?? true,
  }

  private buildRangeSets() {
    return Object.keys(this.constraint.offsets).reduce(
      (acc, key) => {
        this.constraint.offsets[key as keyof Constraint['offsets']].forEach(
          offset => {
            const offsetRange = Array.isArray(offset)
              ? range(offset[0], offset[1] + 1)
              : [offset]
            offsetRange.forEach(value =>
              acc[key as keyof Constraint['offsets']].add(value)
            )
          }
        )
        return acc
      },
      { x: new Set<number>(), y: new Set<number>() }
    )
  }
}
