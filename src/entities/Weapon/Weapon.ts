import RangeConstraint from '../../services/RangeConstraint'
import { SIMPLE_ORTHOGONAL_CONSTRAINT } from '../../recipes/constraints'
import { WeaponConfig } from './types'
import { RangeConstraintConfig, Deployment, RawCoords } from '../../services'

const WEAPON_RANGE_CONSTRAINT_DEFAULTS: Partial<RangeConstraintConfig> = {
  constraints: [SIMPLE_ORTHOGONAL_CONSTRAINT],
}

export default class Weapon {
  power: number
  range: RangeConstraint

  constructor({ power = 1, range = {} } = {} as Partial<WeaponConfig>) {
    this.power = power
    this.range = new RangeConstraint({
      ...WEAPON_RANGE_CONSTRAINT_DEFAULTS,
      ...range,
    })
  }

  /**
   * @function
   * Returns an array of `Coords` which represent tiles housing `Deployment`s who's `Unit`
   * can be targeted by the subject's Weapon from the subject's current coordinates.
   * */
  getTargetableCoords = ({
    deployment,
    fromCoords,
  }: {
    deployment: Deployment
    fromCoords: RawCoords
  }) =>
    this.range
      .getApplicableCoordinates(fromCoords, deployment.grid)
      .filter(coords => {
        const otherTeam = deployment.grid.getCoordinateData(coords)?.deployment
          ?.unit?.team
        return !!(
          otherTeam?.is('hostile', deployment.unit.team) ||
          otherTeam?.is('wildcard', deployment.unit.team)
        )
      }) || []
}
