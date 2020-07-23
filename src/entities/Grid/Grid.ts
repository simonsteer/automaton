import { GridGraph, GridVectorData } from './types'
import { mapGraph } from './utils'
import Base from '../Base'
import { Coords, Pathfinder } from '../../services'

export default class Grid extends Base {
  graph: GridGraph
  private pathfinders = new Map<Symbol, Pathfinder>()

  constructor(
    game: Game,
    { graph, units }: { graph: Tile[][]; units?: [Unit, RawCoords][] }
  ) {
    super(game, 'grid')
    this.graph = mapGraph(graph, (tile, { x, y }) => ({
      coords: new Coords({ x, y }),
      tile,
    }))
    if (units) this.add.units(units)
  }

  get size() {
    return { y: this.graph.length, x: this.graph[0].length }
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
    data: ({ x, y }: RawCoords) =>
      this.graph[y]?.[x] as GridVectorData | undefined,
  }

  add = {
    units: (units: [Unit, RawCoords][]) => {
      units.forEach(([unit, coordinates]) =>
        this.pathfinders.set(
          unit.id,
          new Pathfinder({ grid: this, unit, coordinates })
        )
      )
      return this
    },
  }

  remove = {
    units: (units: Symbol[]) => {
      units.forEach(unitId => this.pathfinders.delete(unitId))
      return this
    },
  }

  clear = () => {
    this.pathfinders.clear()
    return this
  }

  mapTiles<R>(callback: (item: GridVectorData, coordinates: RawCoords) => R) {
    return mapGraph(this.graph, callback)
  }
}
