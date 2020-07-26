import Base from '../Base'
import DirectionalConstraint from '../../services/DirectionalConstraint'
import { ORTHOGONAL_MOVEMENT } from '../../services/DirectionalConstraint/recipes'

type UnitConstructorOptions = {
  team: Team
  movement?: { steps?: number; pattern?: DirectionalConstraint }
  stats?: Partial<Unit['_stats']>
  maxActions?: number
}

export default class Unit extends Base {
  private _stats = {
    offense: 1,
    defense: 0,
    speed: 1,
    health: 1,
  }
  private _team!: Team
  movement: { pattern: DirectionalConstraint; steps: number }
  maxActions: number

  constructor(
    game: Game,
    {
      maxActions = 1,
      movement: {
        pattern = new DirectionalConstraint(ORTHOGONAL_MOVEMENT),
        steps = 1,
      } = {},
      team,
      stats = {},
    }: UnitConstructorOptions
  ) {
    super(game, 'unit')
    this.set.team(team)
    this.set.stats(stats)
    this.maxActions = maxActions
    this.movement = { pattern, steps }
  }

  get stats() {
    return this._stats
  }

  get team() {
    return this._team
  }

  set = {
    stats: (updates: Partial<Unit['_stats']>) => {
      this._stats = { ...this._stats, ...updates }
      return this
    },
    team: (team: Team) => {
      this._team?.['removeUnit'](this)
      this._team = team
      this._team['addUnit'](this)
      return this
    },
  }
}
