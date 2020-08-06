import compact from 'lodash/compact'
import { GridGraph, GridVectorData } from './types'
import { mapGraph } from '../../utils'
import Pathfinder from '../../services/Pathfinder'
import Coords, { RawCoords } from '../../services/Coords'
import { Unit, Tile, Team } from '..'

export default class Grid {
  readonly id = Symbol()
  graph: GridGraph
  pathfinders = new Map<Unit, Pathfinder>()
  coordinates = new Map<string, Unit>()

  constructor({
    graph,
    units,
  }: {
    graph: Tile[][]
    units?: [Unit, RawCoords][]
  }) {
    this.graph = mapGraph(graph, (tile, { x, y }) => ({
      coords: new Coords({ x, y }),
      tile,
    }))
    if (units) this.addUnits(units)
  }

  get size() {
    return { y: this.graph.length, x: this.graph[0].length }
  }

  withinBounds = ({ x, y }: RawCoords) =>
    x >= 0 && x < this.size.x && y >= 0 && y < this.size.y

  getData = (coordinates: RawCoords) => {
    const tile = this.getTile(coordinates)
    if (!tile) {
      return null
    }
    const unitId = this.coordinates.get(Coords.hash(coordinates))
    const pathfinder = unitId && this.pathfinders.get(unitId)

    return {
      pathfinder,
      tile,
    }
  }

  getTile = ({ x, y }: RawCoords) => this.graph[y]?.[x]?.tile

  getPathfinder = (unit: Unit) => this.pathfinders.get(unit)

  getPathfinders = (ids = [...this.pathfinders.keys()]) =>
    compact(ids.map(this.getPathfinder))

  getTeams = () => [
    ...this.getUnits().reduce((acc, { team }) => {
      if (!acc.has(team)) {
        acc.add(team)
      }
      return acc
    }, new Set<Team>()),
  ]

  getUnits = (ids = [...this.pathfinders.keys()]) =>
    this.getPathfinders(ids).map(p => p.unit)

  addUnit = (unit: Unit, coordinates: RawCoords) => {
    this.pathfinders.set(
      unit,
      new Pathfinder({ grid: this, unit, coordinates })
    )
    this.coordinates.set(Coords.hash(coordinates), unit)
    return this
  }

  addUnits = (units: [Unit, RawCoords][]) => {
    units.forEach(args => this.addUnit(...args))
    return this
  }

  removeUnit = (unit: Unit) => {
    this.pathfinders.delete(unit)
    return this
  }

  removeUnits = (units: Unit[]) => {
    units.forEach(this.removeUnit)
    return this
  }

  clear = () => {
    this.pathfinders.clear()
    return this
  }

  mapTiles<R>(callback: (item: GridVectorData, coordinates: RawCoords) => R) {
    return mapGraph(this.graph, callback)
  }
}
