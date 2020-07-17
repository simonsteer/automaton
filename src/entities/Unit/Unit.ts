import Base from '../Base'
import { UnitStats } from './types'
import DirectionalConstraint from '../../services/DirectionalConstraint'
import { DEFAULT_DIRECTIONAL_CONSTRAINT } from '../../services/DirectionalConstraint/constants'

export default class Unit extends Base {
  stats = {
    offense: 1,
    defense: 0,
    speed: 1,
    movement: 1,
    maxHealth: 1,
    numActions: 1,
  }
  directionalConstraint = new DirectionalConstraint(
    DEFAULT_DIRECTIONAL_CONSTRAINT
  )
  allegiance: Allegiance

  constructor(
    game: Game,
    {
      allegiance,
      stats,
    }: { stats?: Partial<UnitStats>; allegiance: Allegiance }
  ) {
    super(game)
    this.allegiance = allegiance
    this.stats = { ...this.stats, ...stats }

    this.game.entities.units.set(this.id, this)
  }
}
