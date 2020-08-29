import Coords, { RawCoords } from '../Coords'
import Graph from './Dijkstra/Graph'
import { Grid, Unit } from '../../entities'

export default class Deployment {
  timestamp: number
  readonly grid: Grid
  readonly unit: Unit
  graph!: Graph
  coordinates: Coords

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
    this.coordinates = new Coords(coordinates)
    this.initGraph()
  }

  private updateCoordinates = (val: Partial<RawCoords>) => {
    this.grid.timestamp++
    this.coordinates.update(val)
  }

  move = (path: RawCoords[]) => {
    if (path.length < 1) {
      console.error(
        `Paths must contain at least one set of coordinates. Deployment#move receieved a path with a length of 0.`
      )
      return []
    }

    const fromHash = this.coordinates.hash

    const result = path.reduce(
      (acc, coordinates, index) => {
        if (acc.abort || this.unit.isDead) {
          return acc
        }
        const data = this.grid.getCoordinateData(coordinates)
        if (!data) {
          throw new Error(
            `No data was found at coordinates: { x: ${coordinates.x}; y: ${coordinates.y} }`
          )
        }

        const { deployment, tile } = data
        const isLastStep = index === path.length - 1

        if (tile.shouldGuardEntry(this, tile)) {
          acc.abort = true
          tile.events.emit('guardEntry', this, tile)
          tile.events.emit('unitStop', this, tile)
        } else {
          const prev = path[index - 1] as RawCoords | undefined
          if (prev)
            this.grid
              .getCoordinateData(prev)
              ?.tile.events.emit('unitExit', this, tile)

          acc.path.push(coordinates)
          this.updateCoordinates(coordinates)
          tile.events.emit('unitEnter', this, tile)

          if (isLastStep) {
            tile.events.emit('unitStop', this, tile)
          } else if (!deployment && tile.shouldGuardCrossover(this, tile)) {
            acc.abort = true
            tile.events.emit('guardCrossover', this, tile)
            tile.events.emit('unitStop', this, tile)
          }
        }

        return acc
      },
      { path: [] as RawCoords[], abort: false }
    ).path

    const toHash = this.coordinates.hash
    if (result.length) {
      this.grid['coordinates'].delete(fromHash)
      this.grid['coordinates'].set(toHash, this.unit.id)
      this.grid.events.emit('unitMovement', this, result)
    }
    return result
  }

  getRoute = (toCoords: RawCoords) => {
    const result = this.graph.path(
      this.unit,
      this.coordinates.hash,
      Coords.hash(toCoords),
      { cost: true }
    ) as { path: null | string[]; cost: number }

    return result.path?.map(Coords.parse).slice(1) || []
  }

  getReachableCoords = () =>
    this.unit.movement
      .getApplicableCoordinates(this.coordinates, this.grid, this.unit)
      .concat(
        this.unit.extraMovementOptions
          .getSpecialCoordinates(this)
          .map(c => new Coords(c))
      )

  private initGraph() {
    this.graph = this.unit.movement['buildDeploymentGraph'](this.grid)
  }
}
