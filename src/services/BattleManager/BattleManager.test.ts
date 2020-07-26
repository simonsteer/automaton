import BattleManager from './BattleManager'
import TurnManager from './TurnManager'
import { Game, Unit } from '../../entities'
import { createSimpleGrid } from '../../utils'
import Team from '../../entities/Team'

describe('BattleManager', () => {
  const game = new Game()
  const grid = createSimpleGrid(game, 5)

  beforeEach(() => {
    grid.clear()
  })

  it('correctly determines if the battle is in progress or not', () => {
    const [team_1, team_2] = new Team(game)
      .split({ branches: 2, siblingRelationship: 'hostile' })
      .get.children()

    const team_1_unit_1 = new Unit(game, { team: team_1 })
    const team_1_unit_2 = new Unit(game, { team: team_1 })

    const team_2_unit_2 = new Unit(game, { team: team_1 })
  })
})
