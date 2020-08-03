export type UnitConfig = {
  team: Team
  movement?: {
    steps?: number
    pattern?: DirectionalConstraint
    canPassThroughUnit?: (otherUnit: Unit) => boolean
  }
  attackRange?: DirectionalConstraint
  health?: number
  actions?: number
  weapon?: Weapon
}
