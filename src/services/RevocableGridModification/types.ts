import { Unit } from '../..'
import { RawCoords } from '../Coords'

type GridModificationTypes = {
  deployUnit: [Unit, RawCoords]
  moveUnit: [Symbol, RawCoords[]]
  withdrawUnit: Symbol
}

export type GridModificationType = keyof GridModificationTypes

export type GridModification<Type extends GridModificationType> = {
  type: Type
  payload: GridModificationTypes[Type]
}

export type GridModifications = (
  | GridModification<'deployUnit'>
  | GridModification<'withdrawUnit'>
  | GridModification<'moveUnit'>
)[]
