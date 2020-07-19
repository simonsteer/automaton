import Coords from '../Coords'

export default class GridManager {
  private game: Game
  readonly grid: Grid
  private units = new Map<Symbol, Coords>()
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
    units: () => [...this.units.keys()].map(this.game.get.unit),
  }

  add = {
    units: (...units: [Unit, RawCoords][]) => {
      units.forEach(([{ id }, { x, y }]) =>
        this.units.set(id, new Coords({ x, y }))
      )
    },
  }
}
