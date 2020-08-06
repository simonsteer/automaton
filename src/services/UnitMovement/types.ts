import { RangeConstraintConfig } from '../RangeConstraint/types'

export type ConstraintMergeStrategy = 'union' | 'intersect' | 'difference'

export type UnitMovementConfig = {
  constraints: RangeConstraintConfig[]
  mergeStrategy: ConstraintMergeStrategy
  steps: number
  canPassThroughUnit: (otherUnit: Unit) => boolean
}
