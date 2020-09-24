import { Team, Unit } from '..'
import { WeaponConfig } from '../Weapon/types'
import { RawCoords } from '../../services'

export type UnitMovementOptions = {
  steps: number
  canPassThroughOtherUnit: (unit: Unit) => boolean
  unitPassThroughLimit: number
  deltas: RawCoords[]
}

export interface UnitConfig {
  team: Team
  movement?: Partial<UnitMovementOptions>
  health?: number
  weapon?: WeaponConfig
}
