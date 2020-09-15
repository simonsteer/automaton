import { RangeConstraintConfig } from '../../services/RangeConstraint/types'
import { Team, Unit, Grid } from '..'
import { WeaponConfig } from '../Weapon/types'
import { RawCoords } from '../..'
import { Deployment } from '../../services'

export type ExtraMovementOptions = {
  steps: number
  getSpecialCoordinates: <U extends Unit = Unit>(
    grid: Deployment<U>
  ) => RawCoords[]
  canPassThroughOtherUnit: (unit: Unit) => boolean
  unitPassThroughLimit: number
}

export interface UnitConfig {
  team: Team
  movement?: Partial<RangeConstraintConfig & ExtraMovementOptions>
  health?: number
  weapon?: WeaponConfig
}
