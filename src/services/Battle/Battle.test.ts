import Battle from './Battle'
import { createSimpleGraph } from '../../utils'
import Team from '../../entities/Team'
import Unit from '../../entities/Unit'
import Grid from '../../entities/Grid'

describe('Battle', () => {
  const [team1, team2] = new Team()
    .split({ splits: 2, siblingRelationship: 'hostile' })
    .getChildren()

  const unit1 = new Unit({ team: team1 })
  const unit2 = new Unit({ team: team2 })

  const grid = new Grid({ graph: createSimpleGraph(5) })
  grid.deployUnits([
    [unit1, { x: 0, y: 0 }],
    [unit2, { x: 1, y: 0 }],
  ])

  it('can correctly tell when the battle has started', () => {
    const battle = new Battle(grid)
    expect(battle.inProgress).toBe(false)
    battle.nextTurn()
    expect(battle.inProgress).toBe(true)
  })

  it('increments turns when iterated through', () => {
    const battle = new Battle(grid)
    expect(battle.turnIndex).toBe(-1)
    battle.nextTurn()
    expect(battle.turnIndex).toBe(0)
  })
})
