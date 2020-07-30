import Base from '../Base'
import DirectionalConstraint from '../../services/DirectionalConstraint'
import { ORTHOGONAL_MOVEMENT } from '../../services/DirectionalConstraint/recipes'

type UnitConstructorOptions = {
  team: Team
  movement?: { steps?: number; pattern?: DirectionalConstraint }
  health?: number
  actions?: number
}

export default class Unit extends Base {
  private _team!: Team
  movement: { pattern: DirectionalConstraint; steps: number }
  actions: number
  maxHealth: number
  currentHealth: number

  constructor(
    game: Game,
    {
      actions = 2,
      movement: {
        pattern = new DirectionalConstraint(ORTHOGONAL_MOVEMENT),
        steps = 1,
      } = {},
      health = 1,
      team,
    }: UnitConstructorOptions
  ) {
    super(game, 'unit')
    this.set.team(team)
    this.actions = actions
    this.movement = { pattern, steps }
    this.maxHealth = health
    this.currentHealth = this.maxHealth
  }

  get isDead() {
    return this.currentHealth <= 0
  }

  get team() {
    return this._team
  }

  set = {
    team: (team: Team) => {
      this._team?.['removeUnit'](this)
      this._team = team
      this._team['addUnit'](this)
      return this
    },
  }
}
