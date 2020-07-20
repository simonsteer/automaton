import Coords from '../Coords'
import compact from 'lodash/compact'
import Pathfinder from '../Pathfinder'

export default class GridManager {
  private game: Game
  readonly grid: Grid
  private units = new Map<Symbol, Pathfinder>()
  constructor({
    game,
    units,
    grid,
  }: {
    game: Game
    grid: Grid
    units: [Unit, RawCoords][]
  }) {
    this.grid = grid
    this.game = game
    this.add.units(...units)
  }

  get = {
    units: () => compact([...this.units.keys()].map(this.game.get.unit)),
  }

  add = {
    units: (...units: [Unit, RawCoords][]) => {
      units.forEach(([unit, coordinates]) =>
        this.units.set(
          unit.id,
          new Pathfinder({ grid: this.grid, unit, coordinates })
        )
      )
    },
  }
}
