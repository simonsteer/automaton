import RangeConstraint from '../../services/RangeConstraint'
import { SIMPLE_ORTHOGONAL_CONSTRAINT } from '../../recipes/constraints'
import { UnitConfig } from './types'
import Game from '../Game'

export default class Unit {
  readonly id = Symbol()
  _team!: Team
  movement: {
    range: RangeConstraint
    steps: number
    canPassThroughUnit: (otherUnit: Unit) => boolean
  }
  actions: number
  maxHealth: number
  currentHealth: number
  weapon?: Weapon

  constructor({
    actions = 2,
    movement: {
      range = new RangeConstraint(SIMPLE_ORTHOGONAL_CONSTRAINT),
      steps = 1,
      canPassThroughUnit = ({ team }: Unit) =>
        team.isFriendly(this.team) || team.isNeutral(this.team),
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
    this.actions = actions
    this.movement = { range, steps, canPassThroughUnit }
    this.maxHealth = health
    this.currentHealth = this.maxHealth
    if ('weapon' in rest) {
      this.weapon = rest.weapon
    } else {
      this.weapon = Game.defaults.weapon
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

  setTeam = (team: Team) => {
    this._team?.['__removeUnit'](this)
    this._team = team
    this._team['__addUnit'](this)
    return this
  }
}
