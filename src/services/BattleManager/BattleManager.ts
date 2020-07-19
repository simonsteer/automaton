export default class BattleManager {
  active = false
  grid: GridManager
  constructor(grid: GridManager) {
    this.grid = grid
  }

  get = {
    teams: () => [],
  }
}
