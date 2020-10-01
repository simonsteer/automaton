import { SIMPLE_ORTHOGONAL_CONSTRAINT } from '../../recipes/constraints'
import { UnitConfig, UnitMovementOptions } from './types'
import DeltaConstraint from '../../services/DeltaConstraint'
import { Team, Weapon } from '..'

export default class Unit {
  readonly id = Symbol()

  private team!: Team

  maxHealth: number
  currentHealth: number
  weapon?: Weapon
  movement: Omit<UnitMovementOptions, 'deltas'> & {
    constraint: DeltaConstraint
  }

  constructor({
    movement: {
      deltas = SIMPLE_ORTHOGONAL_CONSTRAINT,
      steps = 1,
      canPassThroughOtherUnit = (unit: Unit) =>
        unit.team.is('friendly', this.team) ||
        unit.team.is('neutral', this.team),
      unitPassThroughLimit = Infinity,
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
    this.movement = {
      canPassThroughOtherUnit,
      constraint: new DeltaConstraint(deltas),
      steps,
      unitPassThroughLimit,
    }
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

  getTeam<T = Team>() {
    return (this.team as unknown) as T
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
    this.team?.['__removeUnit'](this)
    this.team = team
    this.team['__addUnit'](this)
  }
}
