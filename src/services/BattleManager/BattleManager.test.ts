import BattleManager from './BattleManager'
import { Game, Unit } from '../../entities'
import { createSimpleGrid } from '../../utils'
import Team from '../../entities/Team'

describe('BattleManager', () => {
  beforeEach(() => (battle = new BattleManager(game, grid)))

  const game = new Game()
  const grid = createSimpleGrid(game, 5)

  const [team_1, team_2] = new Team(game)
    .split({ branches: 2, siblingRelationship: 'hostile' })
    .get.children()

  const team_1_units = Array(2)
    .fill(0)
    .map(() => new Unit(game, { team: team_1 }))
  const team_2_units = Array(2)
    .fill(0)
    .map(() => new Unit(game, { team: team_2 }))

  let battle = new BattleManager(game, grid)

  it('does not consider the battle "in progress" if we have not begun iterating through turns', () => {
    expect(battle.inProgress).toBe(false)
    const generator = battle.begin()
    const result = generator.next()
    expect(battle.inProgress).toBe(true)
  })
})
