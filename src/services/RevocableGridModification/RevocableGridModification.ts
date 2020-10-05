import Unit from '../../entities/Unit'
import Grid from '../../entities/Grid'
import Deployment from '../../entities/Deployment'
import { GridModifications } from './types'

export default class RevocableGridModification {
  grid: Grid
  private modifications: GridModifications
  private revocations: (
    | {
        type: 'move'
        payload: [Deployment, { x: number; y: number }]
      }
    | { type: 'deploy'; payload: Unit }
    | { type: 'withdraw'; payload: [Unit, { x: number; y: number }] }
  )[] = []

  constructor(grid: Grid, modifications: GridModifications) {
    this.modifications = modifications
    this.grid = grid
  }

  apply() {
    if (this.revocations.length) return

    this.modifications.forEach(modification => {
      switch (modification.type) {
        case 'deploy':
          const [unit, coords] = modification.payload
          this.revocations.unshift({
            type: modification.type,
            payload: unit,
          })
          this.grid.deploy_units([[unit, coords]])
          break
        case 'move':
          const [id, path] = modification.payload
          const deploymentToMove = this.grid.find_deployment(id)
          if (deploymentToMove) {
            this.revocations.unshift({
              type: modification.type,
              payload: [deploymentToMove, deploymentToMove.coordinates.raw],
            })
            deploymentToMove.move(path)
          }
          break
        case 'withdraw':
          const to_remove = this.grid.find_deployment(
            modification.payload.unit.id
          )
          if (to_remove) {
            this.revocations.unshift({
              type: modification.type,
              payload: [to_remove.unit, to_remove.coordinates.raw],
            })
            this.grid.withdraw_deployments([modification.payload])
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
        case 'deploy':
          revocation.payload.deployment &&
            this.grid.withdraw_deployment(revocation.payload.deployment)
          break
        case 'move':
          const [deployment, originalCoords] = revocation.payload
          deployment.move([originalCoords])
          break
        case 'withdraw':
          this.grid.deploy_units([revocation.payload])
          break
        default:
          break
      }
      this.revocations.shift()
    }
  }
}
