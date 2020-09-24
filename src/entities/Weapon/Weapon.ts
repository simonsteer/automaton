import RangeConstraint from '../../services/DeltaConstraint'
import { SIMPLE_ORTHOGONAL_CONSTRAINT } from '../../recipes/constraints'
import { WeaponConfig } from './types'
import { Deployment, RawCoords } from '../../services'
import { Unit } from '..'
import DeltaConstraint from '../../services/DeltaConstraint'

export default class Weapon {
  power: number
  range: DeltaConstraint

  constructor(
    { power = 1, range = SIMPLE_ORTHOGONAL_CONSTRAINT } = {} as Partial<
      WeaponConfig
    >
  ) {
    this.power = power
    this.range = new DeltaConstraint(range)
  }

  /**
   * Returns an array of `Coords` which represent tiles housing `Deployment`s who's `Unit`
   * can be targeted by the subject's Weapon from the subject's current coordinates.
   * */
  getTargetableCoords = <U extends Unit = Unit>(
    deployment: Deployment<U>,
    fromCoords = deployment.coordinates.raw
  ) =>
    this.range
      .getApplicableCoordinates(fromCoords, deployment.grid)
      .filter(coords => {
        const otherTeam = deployment.grid
          .getCoordinateData(coords)
          ?.deployment?.unit?.getTeam()
        return !!(
          otherTeam?.is('hostile', deployment.unit.getTeam()) ||
          otherTeam?.is('wildcard', deployment.unit.getTeam())
        )
      }) || []
}
