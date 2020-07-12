import { Constraint } from './types'
import { unpackOffsets } from './utils'
import { Coords } from '..'

export default class DirectionalConstraint {
  constraint: Constraint
  constructor(constraint: Constraint) {
    this.constraint = constraint
  }

  applies = (coordsA: Coords, coordsB: Coords) => {
    return Object.values(this.validations).every(validate =>
      validate(coordsA, coordsB)
    )
  }

  adjacent = (coordsA: Coords) => {
    const offsets = this.getOffsetRanges()

    const adjacent = offsets.x.reduce((acc, xOffset) => {
      offsets.y.forEach(yOffset =>
        acc.push({ x: coordsA.x + xOffset, y: coordsA.y + yOffset })
      )
      return acc
    }, [] as RawCoords[])

    return adjacent.filter(coordsB =>
      this.validations.exceptions(coordsA, coordsB)
    )
  }

  private validations = {
    offsets: (coordsA: Coords, coordsB: Coords) => {
      const offsets = this.getOffsetRanges()
      const deltas = coordsA.delta(coordsB)

      return offsets.x.includes(deltas.x) && offsets.y.includes(deltas.y)
    },
    exceptions: (coordsA: Coords, coordsB: RawCoords) => {
      const deltas = coordsA.delta(coordsB)
      return !!this.constraint.exceptions?.every(e => e(deltas))
    },
  }

  private getOffsetRanges() {
    return unpackOffsets(this.constraint.offsets)
  }
}
