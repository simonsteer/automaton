import {
  RangeConstraintConfig,
  GetReachableCooordinatesOptions,
} from '../../services/RangeConstraint/types'
import { Team } from '..'
import { WeaponConfig } from '../Weapon/types'
import Deployment from '../../services/Deployment'
import { RawCoords } from '../..'

export type ExtraMovementOptions = GetReachableCooordinatesOptions & {
  getSpecialCoordinates: (deployment: Deployment) => RawCoords[]
}

export interface UnitConfig {
  team: Team
  movement?: Partial<RangeConstraintConfig & ExtraMovementOptions>
  health?: number
  weapon?: WeaponConfig
}
