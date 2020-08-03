import { Constraint } from '../services/RangeConstraint/types'

export const SIMPLE_ORTHOGONAL_CONSTRAINT: Constraint = {
  offsets: {
    x: [[-1, 1]],
    y: [[-1, 1]],
  },
  exceptions: [({ x, y }) => Math.abs(x) !== Math.abs(y)],
}

export const SIMPLE_DIAGONAL_CONSTRAINT: Constraint = {
  offsets: {
    x: [-1, 1],
    y: [-1, 1],
  },
}

export const SIMPLE_PANORAMIC_CONSTRAINT: Constraint = {
  offsets: {
    x: [[-1, 1]],
    y: [[-1, 1]],
  },
  exceptions: [({ x, y }) => !(x === 0 && y === 0)],
}
