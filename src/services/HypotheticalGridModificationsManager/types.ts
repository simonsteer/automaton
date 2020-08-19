import { Unit } from '../..'
import { RawCoords } from '../Coords'

export type HypotheticalGridModifications = Partial<{
  add: [Unit, RawCoords][]
  move: [Symbol, RawCoords][]
  remove: Symbol[]
}>
