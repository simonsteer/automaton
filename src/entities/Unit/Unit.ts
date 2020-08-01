import Base from '../Base'
import DirectionalConstraint from '../../services/DirectionalConstraint'
import { ORTHOGONAL_CONSTRAINT } from '../../services/DirectionalConstraint/recipes'

type UnitConstructorOptions = {
  team: Team
  movement?: { steps?: number; pattern?: DirectionalConstraint }
  attackRange?: DirectionalConstraint
  health?: number
  actions?: number
  weapon?: Weapon
}

export default class Unit extends Base {
  private _team!: Team
  movement: { pattern: DirectionalConstraint; steps: number }
  actions: number
  maxHealth: number
  currentHealth: number
  weapon?: Weapon

  constructor(
    game: Game,
    {
      actions = 2,
      movement: {
        pattern = new DirectionalConstraint(ORTHOGONAL_CONSTRAINT),
        steps = 1,
      } = {},
      health = 1,
      team,
      weapon,
    }: UnitConstructorOptions
  ) {
    super(game, 'unit')
    this.set.team(team)
    this.actions = actions
    this.movement = { pattern, steps }
    this.maxHealth = health
    this.currentHealth = this.maxHealth
    this.weapon = weapon
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

  unequip = () => {
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
