import { Unit } from '../..'
import { RawCoords } from '../Coords'

export type GridModifications = Partial<{
  add: [Unit, RawCoords][]
  move: [Symbol, RawCoords][]
  remove: Symbol[]
}>
