import RevocableGridModification from './RevocableGridModification'
import { Grid, Unit } from '../..'
import { createSimpleGraph } from '../../utils'
import { Team } from '../../entities'

describe('RevocableGridModification', () => {
  const unit = new Unit({ team: new Team() })

  const fromCoords = { x: 1, y: 4 }
  const toCoords = { x: 3, y: 7 }

  const grid = new Grid({
    graph: createSimpleGraph(10),
    units: [[unit, fromCoords]],
  })

  const unitToAdd = new Unit({ team: new Team() })
  const unitToAddCoords = { x: 0, y: 0 }

  const modification = new RevocableGridModification(grid, [
    { type: 'moveUnit', payload: [unit.id, [toCoords]] },
    { type: 'addUnit', payload: [unitToAdd, unitToAddCoords] },
  ])

  it('can apply modifications to a grid', () => {
    expect(grid.getData(fromCoords)?.pathfinder).not.toBe(undefined)
    expect(grid.getData(toCoords)?.pathfinder).toBe(undefined)
    expect(grid.getData(unitToAddCoords)?.pathfinder).toBe(undefined)

    modification.apply()

    expect(grid.getData(fromCoords)?.pathfinder).toBe(undefined)
    expect(grid.getData(toCoords)?.pathfinder).not.toBe(undefined)
    expect(grid.getData(unitToAddCoords)?.pathfinder).not.toBe(undefined)
  })

  it('can revoke modifications from the grid', () => {
    modification.revoke()

    expect(grid.getData(fromCoords)?.pathfinder).not.toBe(undefined)
    expect(grid.getData(toCoords)?.pathfinder).toBe(undefined)
    expect(grid.getData(unitToAddCoords)?.pathfinder).toBe(undefined)
  })
})
