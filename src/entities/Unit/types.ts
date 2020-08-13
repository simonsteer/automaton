import {
  RangeConstraintConfig,
  GetReachableCooordinatesOptions,
} from '../../services/RangeConstraint/types'
import { Team } from '..'
import { WeaponConfig } from '../Weapon/types'

export interface UnitConfig {
  team: Team
  movement?: Partial<RangeConstraintConfig> &
    Partial<GetReachableCooordinatesOptions>
  health?: number
  actions?: number
  weapon?: WeaponConfig
}
