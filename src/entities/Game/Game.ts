import { BattleManager, GridManager } from '../../services'

export default class Game {
  entities = {
    units: new Map<Symbol, Unit>(),
    grids: new Map<Symbol, Grid>(),
    terrain: new Map<Symbol, Terrain>(),
  } as const;

  *startBattle(grid: Grid, units: [Unit, RawCoords][]) {
    const managedGrid = new GridManager(grid, units)
    const battle = new BattleManager(managedGrid)
    while (true) {
      yield
    }
  }
}
