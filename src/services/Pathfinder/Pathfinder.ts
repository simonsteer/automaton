import Coords, { RawCoords } from '../Coords'
import Graph from './Dijkstra/Graph'
import { Grid, Unit } from '../../entities'

export default class Pathfinder {
  timestamp: number
  readonly grid: Grid
  readonly unit: Unit
  graph!: Graph
  private _coordinates: Coords
  private routeCache: {
    [startEndHash: string]: ReturnType<Pathfinder['getRoute']>
  } = {}

  constructor({
    grid,
    unit,
    coordinates,
  }: {
    grid: Grid
    unit: Unit
    coordinates: RawCoords
  }) {
    this.timestamp = grid.timestamp
    this.grid = grid
    this.unit = unit
    this._coordinates = new Coords(coordinates)
    this.initGraph()
  }

  get coordinates() {
    return this._coordinates
  }

  move = (path: RawCoords[]) => {
    if (path.length < 1) {
      console.error(
        `Paths must contain at least one set of coordinates. Pathfinder#move receieved a path with a length of 0.`
      )
      return []
    }

    const fromHash = this._coordinates.hash

    const result = path.reduce(
      (acc, coordinates, index) => {
        if (acc.abort || this.unit.isDead) {
          return acc
        }

        const data = this.grid.getData(coordinates)
        if (!data) {
          throw new Error(
            `No data was found at coordinates: { x: ${coordinates.x}; y: ${coordinates.y} }`
          )
        }

        const { pathfinder, tile } = data
        const isLastStep = index === path.length - 1

        if (tile.shouldGuardEntry(this, tile)) {
          acc.abort = true
          tile.events.emit('guardEntry', this, tile)
          tile.events.emit('unitStop', this, tile)
        } else {
          const prev = path[index - 1] as RawCoords | undefined
          if (prev)
            this.grid.getData(prev)?.tile.events.emit('unitExit', this, tile)

          acc.path.push(coordinates)
          this.coordinates.update(coordinates)
          tile.events.emit('unitEnter', this, tile)

          if (isLastStep) {
            tile.events.emit('unitStop', this, tile)
          } else if (!pathfinder && tile.shouldGuardCrossover(this, tile)) {
            acc.abort = true
            tile.events.emit('guardCrossover', this, tile)
            tile.events.emit('unitStop', this, tile)
          }
        }

        this.grid.timestamp++
        return acc
      },
      { path: [] as RawCoords[], abort: false }
    ).path

    const toHash = this._coordinates.hash
    if (fromHash !== toHash) {
      this.grid.coordinates.delete(fromHash)
      this.grid.coordinates.set(toHash, this.unit.id)
    }
    return result
  }

  getRoute = (toCoords: RawCoords) => {
    this.checkCache()
    const result = this.graph.path(
      this.unit,
      this.coordinates.hash,
      Coords.hash(toCoords),
      { cost: true }
    ) as { path: null | string[]; cost: number }

    return result.path?.map(Coords.parse).slice(1) || []
  }

  getReachable = () => this.unit.movement.getReachableCoordinates(this)

  getTargetable = (fromCoords = this.coordinates) =>
    this.unit.weapon?.range.adjacent(fromCoords).filter(coords => {
      if (!this.grid.withinBounds(coords)) {
        return false
      }
      const otherTeam = this.grid.getData(coords)?.pathfinder?.unit?.team
      return !!(
        otherTeam?.isHostile(this.unit.team) ||
        otherTeam?.isWildcard(this.unit.team)
      )
    }) || []

  private checkCache() {
    if (this.timestamp !== this.grid.timestamp) {
      this.initGraph()
      this.timestamp = this.grid.timestamp
    }
  }

  private initGraph() {
    this.graph = this.unit.movement.buildPathfinderGraph(this.grid)
  }
}
