import { UnitMovementConfig } from '../../services/UnitMovement/types'
import { Team, Weapon } from '..'

export interface UnitConfig {
  team: Team
  movement?: Partial<UnitMovementConfig>
  health?: number
  actions?: number
  weapon?: Weapon
}
