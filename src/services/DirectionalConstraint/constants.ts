import { Constraint } from './types'

export const DEFAULT_DIRECTIONAL_CONSTRAINT: Constraint = {
  offsets: {
    x: [-1, 1],
    y: [-1, 1],
  },
  exceptions: [({ x, y }) => Math.abs(x) !== Math.abs(y)],
}
