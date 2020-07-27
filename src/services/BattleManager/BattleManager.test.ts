import BattleManager from './BattleManager'
import { Game, Unit } from '../../entities'
import { createSimpleGrid } from '../../utils'
import Team from '../../entities/Team'

describe('BattleManager', () => {
  beforeEach(() => (battle = new BattleManager(grid)))

  const game = new Game()
  const grid = createSimpleGrid(game, 5)

  const [team_1, team_2] = new Team(game)
    .split({ branches: 2, siblingRelationship: 'hostile' })
    .get.children()

  let battle = new BattleManager(grid)

  it('does not consider the battle "in progress" if we have not begun iterating through turns', () => {
    expect(battle.inProgress).toBe(false)
    battle.start().next()
    expect(battle.inProgress).toBe(true)
  })
})
