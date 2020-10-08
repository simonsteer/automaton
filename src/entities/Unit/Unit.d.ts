import DeltaConstraint from '../../services/DeltaConstraint'
import Team from '../Team'
import Deployment from '../Deployment'

type UnitMovement = {
  constraint: DeltaConstraint
  footprint: DeltaConstraint
  steps: number
  can_pass_through_other_unit: (unit: Unit) => boolean
  unit_pass_through_limit: number
}

export default class Unit {
  constructor(config: { movement?: Partial<UnitMovement>; team: Team })
  id: string
  deployment: Deployment | undefined
  current_health: number
  movement: UnitMovement
  team: Team
  switch_team(team: Team): Unit
}
