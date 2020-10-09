import Unit from '../../entities/Unit'
import Team from '../../entities/Team'
import Grid from '../../entities/Grid'
import { create_simple_tileset } from '../../utils'
import RevocableGridModification from './RevocableGridModification'
import DeltaConstraint from '../DeltaConstraint'

describe('RevocableGridModification', () => {
  const unit = new Unit({
    team: new Team(),
    movement: {
      footprint: new DeltaConstraint([
        { x: 0, y: 0 },
        { x: 1, y: 0 },
      ]),
    },
  })

  const fromCoords = { x: 1, y: 4 }
  const toCoords = { x: 3, y: 7 }

  const grid = new Grid({
    tiles: create_simple_tileset(10),
    units: [[unit, fromCoords]],
  })

  const unitToAdd = new Unit({ team: new Team() })
  const unitToAddCoords = { x: 0, y: 0 }

  const modification = new RevocableGridModification(grid, [
    { type: 'move', payload: [unit.id, [toCoords]] },
    { type: 'deploy', payload: [unitToAdd, unitToAddCoords] },
  ])

  it('can apply modifications to a grid', () => {
    expect(grid.tile_at(fromCoords)?.deployment).not.toBe(undefined)
    expect(grid.tile_at(toCoords)?.deployment).toBe(undefined)
    expect(grid.tile_at(unitToAddCoords)?.deployment).toBe(undefined)

    modification.apply()

    expect(grid.tile_at(fromCoords)?.deployment).toBe(undefined)
    expect(grid.tile_at(toCoords)?.deployment).not.toBe(undefined)
    expect(grid.tile_at(unitToAddCoords)?.deployment).not.toBe(undefined)
  })

  it('can revoke modifications from the grid', () => {
    modification.revoke()

    expect(grid.tile_at(fromCoords)?.deployment).not.toBe(undefined)
    expect(grid.tile_at(toCoords)?.deployment).toBe(undefined)
    expect(grid.tile_at(unitToAddCoords)?.deployment).toBe(undefined)
  })
})
