import BattleManager from './BattleManager'
import { createSimpleGraph } from '../../utils'
import { Unit, Team, Grid, Game } from '../../entities'

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
    const generator = battle.start()
    generator.next()
    expect(battle.inProgress).toBe(true)
  })

  it('increments turns when iterated through', () => {
    const battle = new BattleManager(grid)
    const generator = battle.start()
    expect(battle.turn).toBe(-1)
    const iterator = generator.next()
    expect(iterator.value?.turn).toBe(0)
  })
})
