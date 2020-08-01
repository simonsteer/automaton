import compact from 'lodash/compact'
import { GridGraph, GridVectorData } from './types'
import { mapGraph } from './utils'
import Base from '../Base'
import { Coords, Pathfinder } from '../../services'

export default class Grid extends Base {
  graph: GridGraph
  pathfinders = new Map<Symbol, Pathfinder>()
  coordinates = new Map<string, Symbol>()

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

  withinBounds = ({ x, y }: RawCoords) =>
    x >= 0 && x < this.size.x && y >= 0 && y < this.size.y

  get = {
    data: (coordinates: RawCoords) => {
      const tile = this.get.tile(coordinates)
      if (!tile) {
        return null
      }
      const unitId = this.coordinates.get(Coords.hash(coordinates))
      const pathfinder = unitId && this.pathfinders.get(unitId)

      return {
        pathfinder,
        tile,
      }
    },
    tile: ({ x, y }: RawCoords) => this.graph[y]?.[x]?.tile,
    pathfinder: (id: Symbol) => this.pathfinders.get(id),
    pathfinders: (ids = [...this.pathfinders.keys()]) =>
      compact(ids.map(id => this.pathfinders.get(id))),
    teams: () => [
      ...this.get.units().reduce((acc, { team }) => {
        if (!acc.has(team)) {
          acc.add(team)
        }
        return acc
      }, new Set<Team>()),
    ],
    team: (id: Symbol) => this.get.teams().find(team => team.id === id),
    unit: (id: Symbol) => this.get.pathfinder(id)?.unit,
    units: (ids = [...this.pathfinders.keys()]) =>
      this.get.pathfinders(ids).map(p => p.unit),
  }

  add = {
    unit: (unit: Unit, coordinates: RawCoords) => {
      this.pathfinders.set(
        unit.id,
        new Pathfinder({ grid: this, unit, coordinates })
      )
      this.coordinates.set(Coords.hash(coordinates), unit.id)
      return this
    },
    units: (units: [Unit, RawCoords][]) => {
      units.forEach(args => this.add.unit(...args))
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
