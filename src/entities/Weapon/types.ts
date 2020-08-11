import { RangeConstraintConfig } from '../../services'

export type WeaponConfig = {
  power?: number
  range?: Partial<RangeConstraintConfig>
}
