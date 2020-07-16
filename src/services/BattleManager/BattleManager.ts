import groupBy from 'lodash/groupBy'

export default class BattleManager {
  active = false
  grid: GridManager
  constructor(grid: GridManager) {
    this.grid = grid
  }

  get units() {
    return this.grid.units
  }
}

const obj = {
  [Symbol()]: 'hi',
}
