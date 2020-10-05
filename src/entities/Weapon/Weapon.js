import container, { Entity } from '../container'
import DeltaConstraint from '../../services/DeltaConstraint'

class Weapon extends Entity {
  power
  constraint

  constructor({ power = 1, constraint = new DeltaConstraint(SIMPLE_ORTHOGONAL_CONSTRAINT) } = {}) {
    super({ unit: Unit })
    this.power = power
    this.constraint = constraint
  }

  equip = (unit) => {
    this.link_unit(unit)
    unit.link_weapon(this)

    return this
  }

  targetable_coords = (deployment, from_coords = deployment.coordinates.raw) =>
    this.constraint.adjacent(from_coords).filter(coords => {
      if (deployment.grid.out_of_bounds(coords)) {
        return false
      }

      const other_team = deployment.grid.tile_at(coords).deployment
        ?.unit?.team
      return !!(
        other_team?.is(deployment.unit.team, 'hostile') ||
        other_team?.is(deployment.unit.team, 'wildcard')
      )
    }) || []
}

export default container.register(Weapon)