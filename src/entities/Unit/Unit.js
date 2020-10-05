import container, { Entity } from '../container'
import { SIMPLE_ORTHOGONAL_CONSTRAINT } from '../../recipes/constraints'
import DeltaConstraint from '../../services/DeltaConstraint'
import Team from '../Team'
import Weapon from '../Weapon'
import Deployment from '../Deployment'

class Unit extends Entity {
  max_health
  current_health
  movement

  constructor({
    movement: {
      constraint = new DeltaConstraint(SIMPLE_ORTHOGONAL_CONSTRAINT),
      steps = 1,
      can_pass_through_other_unit,
      unit_pass_through_limit = Infinity,
    } = {},
    health = 1,
    team,
    weapon,
  }) {
    super({ team: Team, weapon: Weapon, deployment: Deployment }, () => {
      if (weapon) this.equip(weapon)
      this.switch_team(team)

      if (health < 0) {
        throw new Error(
          `Unit health must be greater than 0. Received value: ${health}`
        )
      }

      this.movement = {
        can_pass_through_other_unit:
          can_pass_through_other_unit ||
          (unit =>
            unit.team.is(this.team, 'friendly') ||
            unit.team.is(this.team, 'neutral')),
        constraint,
        steps,
        unit_pass_through_limit,
      }
      this.max_health = health
      this.current_health = this.max_health
    })
  }

  switch_team = team => {
    if (this.team) this.team.unlink_units(this)
    this.link_team(team)
    team.link_units(this)

    return this
  }

  equip = weapon => {
    this.link_weapon(weapon)
    weapon.link_unit(this)

    return this
  }

  disarm = () => {
    this.unlink_weapon()
    weapon.unlink_unit()
    return this
  }

  get is_armed() {
    return !!this.weapon
  }

  get is_dead() {
    return this.current_health <= 0
  }
}

export default container.register(Unit)
