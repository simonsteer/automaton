import { Constraint } from '../services/DirectionalConstraint/types'

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
