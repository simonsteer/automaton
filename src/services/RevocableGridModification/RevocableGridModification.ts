import { Grid, Unit } from '../../entities'
import { RawCoords } from '../Coords'
import { Pathfinder } from '..'
import { GridModifications } from './types'

export default class RevocableGridModification {
  grid: Grid
  private modifications: GridModifications
  private revocations: (
    | {
        type: 'moveUnit'
        payload: [Pathfinder, RawCoords]
      }
    | { type: 'addUnit'; payload: Symbol }
    | { type: 'removeUnit'; payload: [Unit, RawCoords] }
  )[] = []

  constructor(grid: Grid, modifications: GridModifications) {
    this.modifications = modifications
    this.grid = grid
  }

  apply() {
    if (this.revocations.length) return

    this.modifications.forEach(modification => {
      switch (modification.type) {
        case 'addUnit':
          const [unit, coords] = modification.payload
          this.revocations.unshift({
            type: modification.type,
            payload: unit.id,
          })
          this.grid.addUnits([[unit, coords]])
          break
        case 'moveUnit':
          const [id, path] = modification.payload
          const pathfinderToMove = this.grid.getPathfinder(id)
          if (pathfinderToMove) {
            this.revocations.unshift({
              type: modification.type,
              payload: [pathfinderToMove, pathfinderToMove.coordinates.raw],
            })
            pathfinderToMove.move(path)
          }
          break
        case 'removeUnit':
          const pathfinderToRemove = this.grid.getPathfinder(
            modification.payload
          )
          if (pathfinderToRemove) {
            this.revocations.unshift({
              type: modification.type,
              payload: [
                pathfinderToRemove.unit,
                pathfinderToRemove.coordinates.raw,
              ],
            })
            this.grid.removeUnits([modification.payload])
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
        case 'addUnit':
          this.grid.removeUnits([revocation.payload])
          break
        case 'moveUnit':
          const [pathfinder, originalCoords] = revocation.payload
          pathfinder.move([originalCoords])
          break
        case 'removeUnit':
          this.grid.addUnits([revocation.payload])
          break
        default:
          break
      }
      this.revocations.shift()
    }
  }
}
