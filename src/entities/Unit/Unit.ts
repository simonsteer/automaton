import Base from '../Base'
import { UnitStats } from './types'
import DirectionalConstraint from '../../services/DirectionalConstraint'
import { ORTHOGONAL_MOVEMENT } from '../../services/DirectionalConstraint/recipes'

type UnitConstructorOptions = {
  team: Team
  directionalConstraint?: DirectionalConstraint
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
  directionalConstraint: DirectionalConstraint

  constructor(
    game: Game,
    {
      directionalConstraint = new DirectionalConstraint(ORTHOGONAL_MOVEMENT),
      team,
      stats = {},
    }: UnitConstructorOptions
  ) {
    super(game, 'unit')
    this.set.team(team)
    this.set.stats(stats)
    this.directionalConstraint = directionalConstraint
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
      this.team?.['removeUnit'](this)
      this.team = team
      this.team['addUnit'](this)
      return this
    },
  }
}
