import { RangeConstraintConfig } from '../../services/RangeConstraint/types'
import { Team, Unit } from '..'
import { WeaponConfig } from '../Weapon/types'
import Deployment from '../../services/Deployment'
import { RawCoords } from '../..'

export type ExtraMovementOptions = {
  steps: number
  getSpecialCoordinates: <U extends Unit = Unit>(
    deployment: Deployment<U>
  ) => RawCoords[]
  canPassThroughOtherUnit: <U extends Unit = Unit>(unit: U) => boolean
  unitPassThroughLimit: number
}

export interface UnitConfig {
  team: Team
  movement?: Partial<RangeConstraintConfig & ExtraMovementOptions>
  health?: number
  weapon?: WeaponConfig
}
