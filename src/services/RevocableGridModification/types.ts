import Unit from '../../entities/Unit'
import Deployment from '../../entities/Deployment'

type GridModificationTypes = {
  deploy: [Unit, { x: number; y: number }]
  move: [string, { x: number; y: number }[]]
  withdraw: Deployment
}

export type GridModificationType = keyof GridModificationTypes

export type GridModification<Type extends GridModificationType> = {
  type: Type
  payload: GridModificationTypes[Type]
}

export type GridModifications = (
  | GridModification<'deploy'>
  | GridModification<'withdraw'>
  | GridModification<'move'>
)[]
