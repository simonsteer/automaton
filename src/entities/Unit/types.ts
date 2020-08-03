export type UnitConfig = {
  team: Team
  movement?: {
    steps?: number
    pattern?: RangeConstraint
    canPassThroughUnit?: (otherUnit: Unit) => boolean
  }
  attackRange?: RangeConstraint
  health?: number
  actions?: number
  weapon?: Weapon
}
