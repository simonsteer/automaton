import { UnitMovementConfig } from '../../services/UnitMovement/types'

export interface UnitConfig {
  team: Team
  movement?: Partial<UnitMovementConfig>
  health?: number
  actions?: number
  weapon?: Weapon
}
