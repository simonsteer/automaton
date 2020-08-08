import BattleManager from './BattleManager'
import { createSimpleGraph } from '../../utils'
import Team from '../../entities/Team'
import Unit from '../../entities/Unit'
import Grid from '../../entities/Grid'

describe('BattleManager', () => {
  const [team1, team2] = new Team()
    .split({ branches: 2, siblingRelationship: 'hostile' })
    .getChildren()

  const unit1 = new Unit({ team: team1, actions: 2 })
  const unit2 = new Unit({ team: team2 })

  const grid = new Grid({ graph: createSimpleGraph(5) }).addUnits([
    [unit1, { x: 0, y: 0 }],
    [unit2, { x: 1, y: 0 }],
  ])

  it('can correctly tell when the battle has started', () => {
    const battle = new BattleManager(grid)
    expect(battle.inProgress).toBe(false)
    battle.advance()
    expect(battle.inProgress).toBe(true)
  })

  it('increments turns when iterated through', () => {
    const battle = new BattleManager(grid)
    expect(battle.turnIndex).toBe(-1)
    battle.advance()
    expect(battle.turnIndex).toBe(0)
  })
})
