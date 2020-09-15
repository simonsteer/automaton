import { Unit } from '../..'
import { RawCoords } from '../Coords'

type GridModificationTypes<U extends Unit = Unit> = {
  deployUnit: [U, RawCoords]
  moveUnit: [Symbol, RawCoords[]]
  withdrawUnit: Symbol
}

export type GridModificationType = keyof GridModificationTypes

export type GridModification<
  Type extends GridModificationType,
  U extends Unit = Unit
> = {
  type: Type
  payload: GridModificationTypes<U>[Type]
}

export type GridModifications<U extends Unit = Unit> = (
  | GridModification<'deployUnit', U>
  | GridModification<'withdrawUnit', U>
  | GridModification<'moveUnit', U>
)[]
