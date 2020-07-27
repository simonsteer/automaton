import BattleManager from './BattleManager'
import { Game, Unit } from '../../entities'
import { createSimpleGrid } from '../../utils'
import Team from '../../entities/Team'

describe('BattleManager', () => {
  const game = new Game()
  const grid = createSimpleGrid(game, 5)

  const [team_1, team_2] = new Team(game)
    .split({ branches: 2, siblingRelationship: 'hostile' })
    .get.children()

  const unit1 = new Unit(game, { team: team_1 })
  const unit2 = new Unit(game, { team: team_2 })

  grid.add.units([
    [unit1, { x: 0, y: 0 }],
    [unit2, { x: 4, y: 4 }],
  ])

  it('does not consider the battle "in progress" if we have not begun iterating through turns', () => {
    const battle = new BattleManager(grid)

    expect(battle.inProgress).toBe(false)
    battle.start().next()
    expect(battle.inProgress).toBe(true)
  })

  it('correctly increments turn counter', () => {
    const battle = new BattleManager(grid)

    expect(battle.turn).toBe(-1)
    battle.start().next()
    expect(battle.turn).toBe(0)
  })

  describe('advancing state', () => {
    const battle = new BattleManager(grid)
    const state = battle.start()

    let { team: firstTurnTeam, turn: firstTurn, units } = state.next()
      .value as Exclude<ReturnType<typeof state['next']>['value'], null | void>

    it('correctly updates unit list when performing actions', () => {
      expect(units.length).toBe(1)
      units = units[0].actions.custom(() => {})
      expect(units.length).toBe(0)
    })

    it('can move onto the next team when the current team is done', () => {
      let {
        team: secondTurnTeam,
        turn: secondTurn,
        units: secondTurnUnits,
      } = state.next().value as Exclude<
        ReturnType<typeof state['next']>['value'],
        null | void
      >

      expect(secondTurnTeam.id).not.toBe(firstTurnTeam.id)
      expect(secondTurn).not.toBe(firstTurn)
      expect(secondTurn).toBeGreaterThan(firstTurn)
      expect(secondTurnUnits[0].pathfinder.unit.id).toBe(unit2.id)
    })
  })
})
