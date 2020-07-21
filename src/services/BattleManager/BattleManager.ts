export default class BattleManager {
  private state = {
    inProgress: false,
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

  get = {
    pathfinder: (unit: Unit) => this.grid.get.pathfinder(unit.id),
    pathfinders: () => this.grid.get.pathfinders(),
    teams: () => this.grid.get.teams(),
    teamToMove: () => {
      const { turn } = this.state
      const teams = this.get.teams()
      return teams[turn % teams.length]
    },
  }
}
