import Base from '../Base'
import { UnitStats } from './types'
import DirectionalConstraint from '../../services/DirectionalConstraint'
import { DEFAULT_DIRECTIONAL_CONSTRAINT } from '../../services/DirectionalConstraint/constants'

export default class Unit extends Base {
  private stats = {
    offense: 1,
    defense: 0,
    speed: 1,
    movement: 1,
    maxHealth: 1,
    numActions: 1,
  }
  private allegiance!: Allegiance
  directionalConstraint = new DirectionalConstraint(
    DEFAULT_DIRECTIONAL_CONSTRAINT
  )

  constructor(
    game: Game,
    {
      allegiance,
      stats = {},
    }: { stats?: Partial<UnitStats>; allegiance: Allegiance }
  ) {
    super(game, 'unit')
    this.setAllegiance(allegiance).setStats(stats)
  }

  getStats = () => this.stats

  setStats = (updates: Partial<Unit['stats']>) => {
    this.stats = { ...this.stats, ...updates }
    return this
  }

  getAllegiance = () => this.allegiance

  setAllegiance = (allegiance: Allegiance) => {
    this.allegiance?.units.delete(this.id)
    this.allegiance = allegiance
    this.allegiance.units.add(this.id)
    return this
  }
}
