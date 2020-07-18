import { BattleManager, GridManager } from '../../services'

export default class Game {
  entities = {
    unit: new Map<Symbol, Unit>(),
    grid: new Map<Symbol, Grid>(),
    terrain: new Map<Symbol, Terrain>(),
    allegiance: new Map<Symbol, Allegiance>(),
  } as const
  mappings = {
    allegianceToUnits: new Map<Symbol, Set<Symbol>>(),
  };

  *startBattle(grid: Grid, units: [Unit, RawCoords][]) {
    const managedGrid = new GridManager(grid, units)
    const battle = new BattleManager(managedGrid)
    while (true) {
      yield
    }
  }
}
