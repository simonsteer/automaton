import { Unit } from '../..'
import { RawCoords } from '../Coords'

export type TemporaryGridModifications = Partial<{
  add: [Unit, RawCoords][]
  move: [Symbol, RawCoords][]
  remove: Symbol[]
}>
