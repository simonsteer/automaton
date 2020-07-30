import BattleManager from './BattleManager'
import { createSimpleGraph } from '../../utils'
import { Game, Unit, Team, Grid } from '../../entities'

describe('BattleManager', () => {
  const game = new Game()

  const [team1, team2] = new Team(game)
    .split({ branches: 2, siblingRelationship: 'hostile' })
    .get.children()

  const unit1 = new Unit(game, { team: team1, actions: 2 })
  const unit2 = new Unit(game, { team: team2 })

  const grid = new Grid(game, { graph: createSimpleGraph(game, 5) }).add.units([
    [unit1, { x: 0, y: 0 }],
    [unit2, { x: 1, y: 0 }],
  ])

  const battle = new BattleManager(grid)
  let [generator, state] = battle.start()

  beforeEach(() => {
    ;[generator, state] = battle.start()
  })

  it('can correctly tell when the battle has started', () => {
    const battle = new BattleManager(grid)
    expect(battle.inProgress).toBe(false)
    battle.start()
    expect(battle.inProgress).toBe(true)
  })

  it('increments turns when iterated through', () => {
    expect(battle.turn).toBe(0)
    state = generator.next()
    expect(state.value.turn).toBe(1)
  })
})
