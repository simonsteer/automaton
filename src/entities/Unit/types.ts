import {
  RangeConstraintConfig,
  GetReachableCooordinatesOptions,
} from '../../services/RangeConstraint/types'
import { Team, Unit } from '..'
import { WeaponConfig } from '../Weapon/types'
import Deployment from '../../services/Deployment'
import { RawCoords } from '../..'

export type ExtraMovementOptions = GetReachableCooordinatesOptions & {
  getSpecialCoordinates: <U extends Unit = Unit>(
    deployment: Deployment<U>
  ) => RawCoords[]
  steps: number
}

export interface UnitConfig {
  team: Team
  movement?: Partial<RangeConstraintConfig & ExtraMovementOptions>
  health?: number
  weapon?: WeaponConfig
}
