import { RawCoords } from '../services'

export const SIMPLE_ORTHOGONAL_CONSTRAINT: RawCoords[] = [
  { x: -1, y: 0 },
  { x: 1, y: 0 },
  { x: 0, y: 1 },
  { x: 0, y: -1 },
]

export const SIMPLE_DIAGONAL_CONSTRAINT: RawCoords[] = [
  { x: -1, y: -1 },
  { x: 1, y: 1 },
  { x: -1, y: 1 },
  { x: 1, y: -1 },
]

export const SIMPLE_PANORAMIC_CONSTRAINT = [
  ...SIMPLE_ORTHOGONAL_CONSTRAINT,
  ...SIMPLE_DIAGONAL_CONSTRAINT,
]
