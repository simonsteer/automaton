import { BattleManager } from '../../services'
import { GameEntities } from './types'

export default class Game {
  private battle?: BattleManager
  private entities = {
    units: new Map<Symbol, Unit>(),
    grids: new Map<Symbol, Grid>(),
    terrain: new Map<Symbol, Terrain>(),
  } as const

  constructor(
    { units = [], grids = [] } = {} as Partial<Omit<GameEntities, 'terrain'>>
  ) {
    units.forEach(this.addUnit)
    grids.forEach(this.addGrid)
  }

  addUnit(unit: Unit) {
    this.entities.units.set(unit.id, unit)
  }

  addGrid(grid: Grid) {
    this.entities.grids.set(grid.id, grid)
    grid.mapTiles(item => {
      const { terrain } = item.tile
      if (!this.entities.terrain.has(terrain.id)) {
        this.addTerrain(terrain)
      }
    })
  }

  private addTerrain(terrain: Terrain) {
    this.entities.terrain.set(terrain.id, terrain)
  }

  private *loop() {
    while (this.battle) {
      yield
    }
  }
}
