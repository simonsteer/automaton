import { RangeConstraint } from '../../services'
import { SIMPLE_ORTHOGONAL_CONSTRAINT } from '../../recipes/constraints'
import { WeaponConfig } from './types'

export default class Weapon {
  power: number
  range: RangeConstraint

  constructor(
    {
      power = 1,
      range = new RangeConstraint(SIMPLE_ORTHOGONAL_CONSTRAINT),
    } = {} as WeaponConfig
  ) {
    this.power = power
    this.range = range
  }
}
