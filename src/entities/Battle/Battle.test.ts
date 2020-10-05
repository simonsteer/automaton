import Battle from '../Battle'
import { create_simple_tileset } from '../../utils'
import Team from '../Team'
import Unit from '../Unit'
import Grid from '../Grid'

describe('Battle', () => {
  const team1 = new Team()
  const team2 = new Team({ hostile: [team1] })

  const unit1 = new Unit({ team: team1 })
  const unit2 = new Unit({ team: team2 })

  const grid = new Grid({ tiles: create_simple_tileset(5) })
  grid.deploy_units([
    [unit1, { x: 0, y: 0 }],
    [unit2, { x: 1, y: 0 }],
  ])

  it('can correctly tell when the battle has started', () => {
    const battle = new Battle(grid)
    expect(battle.in_progress).toBe(false)
    battle.advance()
    expect(battle.in_progress).toBe(true)
  })

  it('increments turns when iterated through', () => {
    const battle = new Battle(grid)
    expect(battle.turn_index).toBe(-1)
    battle.advance()
    expect(battle.turn_index).toBe(0)
  })
})
