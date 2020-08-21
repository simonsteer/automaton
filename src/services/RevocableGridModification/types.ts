import { Unit } from '../..'
import { RawCoords } from '../Coords'

type GridModificationTypes = {
  addUnit: [Unit, RawCoords]
  moveUnit: [Symbol, RawCoords[]]
  removeUnit: Symbol
}

export type GridModificationType = keyof GridModificationTypes

export type GridModification<Type extends GridModificationType> = {
  type: Type
  payload: GridModificationTypes[Type]
}

export type GridModifications = (
  | GridModification<'addUnit'>
  | GridModification<'removeUnit'>
  | GridModification<'moveUnit'>
)[]
