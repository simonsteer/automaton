import Pathfinder from '../Pathfinder'

export default class GridManager {
  game: Game
  readonly grid: Grid
  private pathfinders = new Map<Symbol, Pathfinder>()
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
    pathfinder: (id: Symbol) => this.pathfinders.get(id),
    pathfinders: () => [...this.pathfinders.values()],
    teams: () => [
      ...this.get.pathfinders().reduce((acc, pathfinder) => {
        const team = pathfinder.unit.get.team()
        if (!acc.has(team)) {
          acc.add(team)
        }
        return acc
      }, new Set<Team>()),
    ],
  }

  add = {
    units: (...units: [Unit, RawCoords][]) => {
      units.forEach(([unit, coordinates]) =>
        this.pathfinders.set(
          unit.id,
          new Pathfinder({ grid: this.grid, unit, coordinates })
        )
      )
    },
  }
}
