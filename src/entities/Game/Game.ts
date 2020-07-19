import { BattleManager, GridManager } from '../../services'

export default class Game {
  entities = {
    unit: new Map<Symbol, Unit>(),
    grid: new Map<Symbol, Grid>(),
    terrain: new Map<Symbol, Terrain>(),
    team: new Map<Symbol, Team>(),
  } as const

  getUnit = (unitId: Symbol) => this.entities.unit.get(unitId);

  *startBattle(grid: Grid, units: [Unit, RawCoords][]) {
    const managedGrid = new GridManager(grid, units)
    const battle = new BattleManager(managedGrid)
    while (true) {
      yield
    }
  }
}
