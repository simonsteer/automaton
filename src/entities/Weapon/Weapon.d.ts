import DeltaConstraint from '../../services/DeltaConstraint'
import Unit from '../Unit'
import Deployment from '../Deployment'

export default class Weapon {
  constructor(options?: Partial<{ power: number; constraint: DeltaConstraint }>)
  id: string
  unit: Unit | undefined
  power: number
  constraint: DeltaConstraint
  equip(unit: Unit): Weapon
  targetable_coords(
    deployment: Deployment,
    from?: { x: number; y: number }
  ): { x: number; y: number }[]
}
