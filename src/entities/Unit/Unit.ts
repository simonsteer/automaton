import Base from '../Base'
import { UnitStats } from './types'
import DirectionalConstraint from '../../services/DirectionalConstraint'
import { DEFAULT_DIRECTIONAL_CONSTRAINT } from '../../services/DirectionalConstraint/constants'

type UnitConstructorOptions = {
  team: Team
  stats?: Partial<UnitStats>
}

export default class Unit extends Base {
  private stats = {
    offense: 1,
    defense: 0,
    speed: 1,
    movement: 1,
    maxHealth: 1,
    maxActions: 1,
  }
  private team!: Team
  directionalConstraint = new DirectionalConstraint(
    DEFAULT_DIRECTIONAL_CONSTRAINT
  )

  constructor(game: Game, { team, stats = {} }: UnitConstructorOptions) {
    super(game, 'unit')
    this.set.team(team)
    this.set.stats(stats)
  }

  get = {
    stats: () => this.stats,
    team: () => this.team,
  }

  set = {
    stats: (updates: Partial<Unit['stats']>) => {
      this.stats = { ...this.stats, ...updates }
      return this
    },
    team: (team: Team) => {
      this.team?.remove.unit(this)
      this.team = team
      this.team.add.unit(this)
      return this
    },
  }
}
