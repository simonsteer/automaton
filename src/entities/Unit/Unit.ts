import Base from '../Base'
import DirectionalConstraint from '../../services/DirectionalConstraint'
import { SIMPLE_ORTHOGONAL_CONSTRAINT } from '../../recipes/constraints'

export type UnitConstructorOptions = {
  team: Team
  movement?: {
    steps?: number
    pattern?: DirectionalConstraint
    canPassThroughUnit?: (otherUnit: Unit) => boolean
  }
  attackRange?: DirectionalConstraint
  health?: number
  actions?: number
  weapon?: Weapon
}

export default class Unit extends Base {
  private _team!: Team
  movement: {
    pattern: DirectionalConstraint
    steps: number
    canPassThroughUnit: (otherUnit: Unit) => boolean
  }
  actions: number
  maxHealth: number
  currentHealth: number
  weapon?: Weapon

  constructor(
    game: Game,
    {
      actions = 2,
      movement: {
        pattern = new DirectionalConstraint(SIMPLE_ORTHOGONAL_CONSTRAINT),
        steps = 1,
        canPassThroughUnit = ({ team }: Unit) =>
          team.is.friendly(this.team) || team.is.neutral(this.team),
      } = {},
      health = 1,
      team,
      ...rest
    }: UnitConstructorOptions
  ) {
    super(game, 'unit')
    if (health < 0) {
      throw new Error(
        `Unit health must be greater than 0. Received value: ${health}`
      )
    }
    this.set.team(team)
    this.actions = actions
    this.movement = { pattern, steps, canPassThroughUnit }
    this.maxHealth = health
    this.currentHealth = this.maxHealth
    if ('weapon' in rest) {
      this.weapon = rest.weapon
    } else {
      this.weapon = this.game.defaults.weapon
    }
  }

  get isArmed() {
    return !!this.weapon
  }

  get isDead() {
    return this.currentHealth <= 0
  }

  get team() {
    return this._team
  }

  equip = (weapon: Weapon) => {
    this.weapon = weapon
    return this
  }

  disarm = () => {
    this.weapon = undefined
    return this
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
