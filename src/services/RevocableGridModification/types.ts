import { Unit } from '../..'
import { RawCoords } from '../Coords'

type GridModificationTypes = {
  add: [Unit, RawCoords]
  move: [Symbol, RawCoords[]]
  remove: Symbol
}

export type GridModificationType = keyof GridModificationTypes

export type GridModification<Type extends GridModificationType> = {
  type: Type
  payload: GridModificationTypes[Type]
}

export type GridModifications = (
  | GridModification<'add'>
  | GridModification<'remove'>
  | GridModification<'move'>
)[]
