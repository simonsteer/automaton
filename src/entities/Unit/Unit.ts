import { SIMPLE_ORTHOGONAL_CONSTRAINT } from '../../recipes/constraints'
import { UnitConfig, ExtraMovementOptions } from './types'
import { Team, Weapon, Grid } from '..'
import { RangeConstraint, Deployment, RawCoords } from '../../services'

export default class Unit {
  readonly id = Symbol()
  _team!: Team
  movement: RangeConstraint
  maxHealth: number
  currentHealth: number
  weapon?: Weapon
  extraMovementOptions: ExtraMovementOptions

  constructor({
    movement: {
      constraints = [SIMPLE_ORTHOGONAL_CONSTRAINT],
      mergeStrategy = 'union',
      steps = 1,
      canPassThroughUnit = (deployment: Deployment) =>
        deployment.unit.team.is('friendly', this.team) ||
        deployment.unit.team.is('neutral', this.team),
      unitPassThroughLimit = Infinity,
      getSpecialCoordinates = () => [],
    } = {},
    health = 1,
    team,
    ...rest
  }: UnitConfig) {
    if (health < 0) {
      throw new Error(
        `Unit health must be greater than 0. Received value: ${health}`
      )
    }

    this.setTeam(team)
    this.extraMovementOptions = {
      canPassThroughUnit,
      unitPassThroughLimit,
      getSpecialCoordinates,
    }
    this.movement = new RangeConstraint({
      constraints,
      steps,
      mergeStrategy,
    })

    this.maxHealth = health
    this.currentHealth = this.maxHealth

    if ('weapon' in rest) {
      if (rest.weapon !== undefined) this.weapon = new Weapon(rest.weapon)
    } else {
      this.weapon = new Weapon()
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

  /**
   * Equips the `Unit` in question with a `Weapon` and returns the instance.
   */
  equip = (weapon: Weapon) => {
    this.weapon = weapon
    return this
  }

  /**
   * Unequips the active weapon from the `Unit` in question and returns the instance.
   */
  disarm = () => {
    this.weapon = undefined
    return this
  }

  /**
   * Updates the `Unit` in question to be a part of the given `Team`.
   * @returns `Unit` (itself)
   */
  setTeam = (team: Team) => {
    this._team?.['__removeUnit'](this)
    this._team = team
    this._team['__addUnit'](this)
    return this
  }
}
