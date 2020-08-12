import compact from 'lodash/compact'
import { GridGraph, GridVectorData, GridEvents } from './types'
import { mapGraph } from '../../utils'
import Pathfinder from '../../services/Pathfinder'
import Coords, { RawCoords } from '../../services/Coords'
import { Unit, Tile, Team } from '..'
import { TypedEventEmitter } from '../../services'

export default class Grid {
  timestamp = Date.now()
  readonly id = Symbol()
  graph: GridGraph
  pathfinders = new Map<Symbol, Pathfinder>()
  coordinates = new Map<string, Symbol>()
  events = new TypedEventEmitter<GridEvents>()

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
    if (!tile) return null

    const unitId = this.coordinates.get(Coords.hash(coordinates))
    const pathfinder = unitId && this.pathfinders.get(unitId)

    return { pathfinder, tile }
  }

  getTile = ({ x, y }: RawCoords) => this.graph[y]?.[x]?.tile

  getPathfinder = (unitId: Symbol) => this.pathfinders.get(unitId)

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

  private addUnit = (
    unit: Unit,
    coordinates: RawCoords
  ): [false, undefined] | [true, Pathfinder] => {
    if (this.pathfinders.get(unit.id)) {
      return [false, undefined]
    }
    const pathfinder = new Pathfinder({
      grid: this,
      unit,
      coordinates,
    })
    this.pathfinders.set(unit.id, pathfinder)
    this.coordinates.set(Coords.hash(coordinates), unit.id)
    return [true, pathfinder]
  }

  addUnits = (units: [Unit, RawCoords][]) => {
    this.events.emit(
      'addUnits',
      units
        .map(args => this.addUnit(...args))
        .filter(([success]) => success)
        .map(([_, pathfinder]) => pathfinder!)
    )
    return this
  }

  private removeUnit = (unitId: Symbol) => {
    const pathfinder = this.pathfinders.get(unitId)
    if (pathfinder) {
      this.coordinates.delete(pathfinder.coordinates.hash)
      this.pathfinders.delete(unitId)
    }
    return [unitId, !!pathfinder] as const
  }

  removeUnits = (unitIds: Symbol[]) => {
    const results = unitIds.map(this.removeUnit)
    this.events.emit(
      'removeUnits',
      results.filter(([_, success]) => success).map(([id]) => id)
    )
    return this
  }

  clear = () => {
    this.removeUnits([...this.pathfinders.keys()])
    return this
  }

  mapTiles<R>(callback: (item: GridVectorData, coordinates: RawCoords) => R) {
    return mapGraph(this.graph, callback)
  }
}
