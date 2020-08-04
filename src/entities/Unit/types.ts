export interface UnitConfig {
  team: Team
  movement?: {
    steps?: number
    range?: RangeConstraint
    canPassThroughUnit?: (otherUnit: Unit) => boolean
  }
  health?: number
  actions?: number
  weapon?: Weapon
}
