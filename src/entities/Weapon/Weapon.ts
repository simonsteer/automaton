import Base from '../Base'
import { DirectionalConstraint } from '../../services'
import { SIMPLE_ORTHOGONAL_CONSTRAINT } from '../../recipes/constraints'
import { WeaponConfig } from './types'

export default class Weapon extends Base {
  power: number
  range: DirectionalConstraint

  constructor(
    game: Game,
    {
      power = 1,
      range = new DirectionalConstraint(SIMPLE_ORTHOGONAL_CONSTRAINT),
    } = {} as WeaponConfig
  ) {
    super(game, 'weapon')
    this.power = power
    this.range = range
  }
}
