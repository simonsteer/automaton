import TurnManager from './TurnManager'
import Team from '../../../entities/Team'
import { createSimpleGraph } from '../../../utils'
import BattleManager from '../../BattleManager'
import Unit from '../../../entities/Unit'
import Grid from '../../../entities/Grid'

describe('TurnManager', () => {
  const [team1, team2] = new Team()
    .split({ branches: 2, siblingRelationship: 'hostile' })
    .getChildren()

  const unit1 = new Unit({ team: team1, actions: 2 })
  const unit2 = new Unit({ team: team2 })

  const grid = new Grid({ graph: createSimpleGraph(5) }).addUnits([
    [unit1, { x: 0, y: 0 }],
    [unit2, { x: 1, y: 0 }],
  ])

  const battle = new BattleManager(grid)

  beforeEach(() => (battle.turnIndex = 0))

  it('gets the correct units for each turn that passes', () => {
    const turn1 = new TurnManager(battle)
    const unitsTurn1 = turn1.getActionableUnits()
    expect(unitsTurn1[0].unit.id).toBe(unit1.id)
    expect(unitsTurn1.length).toBe(1)

    battle.turnIndex++
    const turn2 = new TurnManager(battle)
    const unitsTurn2 = turn2.getActionableUnits()
    expect(unitsTurn2[0].unit.id).toBe(unit2.id)
    expect(unitsTurn2.length).toBe(1)
  })

  it('filters units from actionableUnits as actions are used up', () => {
    const turn = new TurnManager(battle)

    let units = turn.getActionableUnits()
    expect(turn.getActionableUnits().length).toBe(1)

    expect(units[0].actionsTaken).toBe(0)
    units[0].actions.custom(() => {})
    expect(units[0].actionsTaken).toBe(1)
    units[0].actions.custom(() => {})
    expect(units[0].actionsTaken).toBe(2)

    expect(turn.getActionableUnits().length).toBe(0)
  })
})
