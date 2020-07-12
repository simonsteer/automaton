import Base from '../Base'
import { UnitStats } from './types'
import DirectionalConstraint from '../../services/DirectionalConstraint'
import { DEFAULT_DIRECTIONAL_CONSTRAINT } from '../../services/DirectionalConstraint/constants'

export default class Unit extends Base {
  offense = 1
  defense = 0
  speed = 1
  movement = 1
  maxHealth = 1
  numActions = 1
  directionalConstraint = new DirectionalConstraint(
    DEFAULT_DIRECTIONAL_CONSTRAINT
  )

  constructor(stats: Partial<UnitStats>) {
    super()
    for (const stat in stats) {
      this[stat as keyof UnitStats] = stats[stat as keyof UnitStats] as number
    }
  }
}
