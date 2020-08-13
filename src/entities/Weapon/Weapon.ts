import RangeConstraint from '../../services/RangeConstraint'
import { SIMPLE_ORTHOGONAL_CONSTRAINT } from '../../recipes/constraints'
import { WeaponConfig } from './types'
import { RangeConstraintConfig } from '../../services'

const WEAPON_RANGE_CONSTRAINT_DEFAULTS: Partial<RangeConstraintConfig> = {
  canPassThroughUnit: () => true,
  constraints: [SIMPLE_ORTHOGONAL_CONSTRAINT],
}

export default class Weapon {
  power: number
  range: RangeConstraint

  constructor({ power = 1, range = {} } = {} as WeaponConfig) {
    this.power = power
    this.range = new RangeConstraint({
      ...WEAPON_RANGE_CONSTRAINT_DEFAULTS,
      ...range,
    })
  }
}
