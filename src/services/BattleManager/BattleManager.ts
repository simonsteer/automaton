import TurnManager from './TurnManager'

export default class BattleManager {
  inProgress = false
  turn = -1
  grid: Grid
  endCondition = (battle: BattleManager) => false

  constructor(grid: Grid) {
    this.grid = grid
  }

  *start() {
    this.inProgress = true
    while (this.inProgress) {
      const turn = new TurnManager(this)
      yield* turn.start()
    }
  }

  get = {
    pathfinder: (unit: Unit) => this.grid.get.pathfinder(unit.id),
    pathfinders: () => this.grid.get.pathfinders(),
    teams: () => this.grid.get.teams(),
  }
}
