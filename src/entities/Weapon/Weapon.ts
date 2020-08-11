import RangeConstraint from '../../services/RangeConstraint'
import { SIMPLE_ORTHOGONAL_CONSTRAINT } from '../../recipes/constraints'
import { WeaponConfig } from './types'

export default class Weapon {
  power: number
  range: RangeConstraint

  constructor(
    {
      power = 1,
      range = {
        canPassThroughUnit: () => true,
        constraints: [SIMPLE_ORTHOGONAL_CONSTRAINT],
        mergeStrategy: 'union',
        steps: 1,
      },
    } = {} as WeaponConfig
  ) {
    this.power = power
    this.range = new RangeConstraint(range)
  }
}
