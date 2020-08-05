import { RangeConstraintConfig } from '../../services'
import { ConstraintMergeStrategy } from '../../services/UnitMovement/types'

export interface UnitConfig {
  team: Team
  movement?: {
    steps?: number
    canPassThroughUnit?: (otherUnit: Unit) => boolean
    constraints?: RangeConstraintConfig[]
    mergeStrategy?: ConstraintMergeStrategy
  }
  health?: number
  actions?: number
  weapon?: Weapon
}
