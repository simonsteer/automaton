export default class BattleManager {
  private state = {
    turn: -1,
  }
  grid: GridManager
  endCondition: (battle: BattleManager) => boolean

  constructor(
    grid: GridManager,
    endCondition: (battle: BattleManager) => boolean
  ) {
    this.grid = grid
    this.endCondition = endCondition
  }

  *start() {}

  private advanceTurn() {
    this.state.turn++

    return this.state
  }

  get = {
    teams: () => [
      ...this.grid.get.units().reduce((acc, unit) => {
        const team = unit.get.team()
        if (!acc.has(team)) {
          acc.add(team)
        }
        return acc
      }, new Set<Team>()),
    ],
  }
}
