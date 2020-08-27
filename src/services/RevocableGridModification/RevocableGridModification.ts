import { Grid, Unit } from '../../entities'
import { RawCoords } from '../Coords'
import { Deployment } from '..'
import { GridModifications } from './types'

export default class RevocableGridModification {
  grid: Grid
  private modifications: GridModifications
  private revocations: (
    | {
        type: 'moveUnit'
        payload: [Deployment, RawCoords]
      }
    | { type: 'deployUnit'; payload: Symbol }
    | { type: 'withdrawUnit'; payload: [Unit, RawCoords] }
  )[] = []

  constructor(grid: Grid, modifications: GridModifications) {
    this.modifications = modifications
    this.grid = grid
  }

  apply() {
    if (this.revocations.length) return

    this.modifications.forEach(modification => {
      switch (modification.type) {
        case 'deployUnit':
          const [unit, coords] = modification.payload
          this.revocations.unshift({
            type: modification.type,
            payload: unit.id,
          })
          this.grid.deployUnits([[unit, coords]])
          break
        case 'moveUnit':
          const [id, path] = modification.payload
          const deploymentToMove = this.grid.getDeployment(id)
          if (deploymentToMove) {
            this.revocations.unshift({
              type: modification.type,
              payload: [deploymentToMove, deploymentToMove.coordinates.raw],
            })
            deploymentToMove.move(path)
          }
          break
        case 'withdrawUnit':
          const deploymentToRemove = this.grid.getDeployment(
            modification.payload
          )
          if (deploymentToRemove) {
            this.revocations.unshift({
              type: modification.type,
              payload: [
                deploymentToRemove.unit,
                deploymentToRemove.coordinates.raw,
              ],
            })
            this.grid.withdrawUnits([modification.payload])
          }
          break
        default:
          break
      }
    })
  }

  revoke() {
    while (this.revocations.length) {
      const revocation = this.revocations[0]
      switch (revocation.type) {
        case 'deployUnit':
          this.grid.withdrawUnits([revocation.payload])
          break
        case 'moveUnit':
          const [deployment, originalCoords] = revocation.payload
          deployment.move([originalCoords])
          break
        case 'withdrawUnit':
          this.grid.deployUnits([revocation.payload])
          break
        default:
          break
      }
      this.revocations.shift()
    }
  }
}
