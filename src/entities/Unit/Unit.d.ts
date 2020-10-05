import DeltaConstraint from '../../services/DeltaConstraint'
import Team from '../Team'
import Weapon from '../Weapon'
import Deployment from '../Deployment'

type UnitMovement = {
  constraint: DeltaConstraint
  steps: number
  can_pass_through_other_unit: (unit: Unit) => boolean
  unit_pass_through_limit: number
}

export default class Unit {
  constructor(config: {
    movement?: Partial<UnitMovement>
    health?: number
    team: Team
    weapon?: Weapon
  })
  id: string
  deployment: Deployment | undefined
  max_health: number
  current_health: number
  movement: UnitMovement
  team: Team
  switch_team(team: Team): Unit
  weapon: Weapon
  equip(weapon: Weapon): Unit
  disarm(): Unit
  is_armed: boolean
  is_dead: boolean
}
