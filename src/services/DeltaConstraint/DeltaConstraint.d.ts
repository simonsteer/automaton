import Coords from '../Coords'

export default class DeltaConstraint {
  constructor(deltas: { x: number; y: number }[])
  adjacent(from: { x: number; y: number }): Coords[]
  applies(
    coords_a: { x: number; y: number },
    coords_b: { x: number; y: number }
  ): boolean
  size: number
}
