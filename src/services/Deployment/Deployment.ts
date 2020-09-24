import Coords, { RawCoords } from '../Coords'
import Graph from './Dijkstra/Graph'
import { Grid, Unit } from '../../entities'
import Constraint from '../DeltaConstraint/DeltaConstraint'
import { GraphNodeMap, GraphNodeNeighbour } from './Dijkstra/types'

export default class Deployment<U extends Unit = Unit> {
  timestamp: number
  readonly grid: Grid<U>
  readonly unit: U
  graph!: Graph
  coordinates: Coords
  actionsTaken = 0

  constructor({
    grid,
    unit,
    coordinates,
  }: {
    grid: Grid<U>
    unit: U
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

  get tile() {
    return this.grid.getCoordinateData(this.coordinates.raw)!.tile
  }

  /**
   * Emits `BattleEvents.unitsEngaged`, with the instance as the first unit, and the given `Deployment` as the second.
   *
   * Consider using in conjunction with `Deployment.getTargetableDeployments`.
   */
  engage = (otherDeployment: Deployment<U>): void => {
    this.grid.events.emit('unitsEngaged', this, otherDeployment)
    this.actionsTaken++
  }

  /**
   * Move the `Deployment` along a given path - all `TileEvents` may be emitted
   * as a result of this function. `GridEvents.unitMovement` will get emitted if
   * the `Deployment` moves at least one space.
   *
   * This method should always be used over manually updating the `Deployment`'s
   * coordinates, etc.
   *
   * Consider using in conjunction with `Deployment.getRoute` and/or
   * `Deployment.getReachableCoords`.
   */
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
          this.grid.events.emit('guardTileEntry', this, tile)
          this.grid.events.emit('unitStopTile', this, tile)
        } else {
          const prev = path[index - 1] as RawCoords | undefined
          if (prev) this.grid.events.emit('unitExitTile', this, tile)

          acc.path.push(coordinates)
          this.updateCoordinates(coordinates)
          this.grid.events.emit('unitEnterTile', this, tile)

          if (isLastStep) {
            this.grid.events.emit('unitStopTile', this, tile)
          } else if (!deployment && tile.shouldGuardCrossover(this, tile)) {
            acc.abort = true
            this.grid.events.emit('guardTileCrossover', this, tile)
            this.grid.events.emit('unitStopTile', this, tile)
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
    this.actionsTaken++
    return result
  }

  /**
   * Attempts to find the route from a given set of coordinates (`fromCoords`) to
   * another (`toCoords`), based on the configuration of `Deployment.unit.movement`.
   *
   * By default, value of `toCoords` is the instance's current coordinates.
   * If no route is found, an empty array is returned.
   *
   * Consider using in conjunction with `Deployment.move`.
   */
  getRoute = ({
    toCoords,
    fromCoords = this.coordinates.raw,
  }: {
    toCoords: RawCoords
    fromCoords?: RawCoords
  }) => {
    const result = this.graph.path(
      this.unit,
      Coords.hash(fromCoords),
      Coords.hash(toCoords),
      { cost: true }
    ) as { path: null | string[]; cost: number }

    return result.path?.map(Coords.parse).slice(1) || []
  }

  /**
   * Get all reachable coordinates from a given pair of `RawCoords`, based on
   * the configuration of `Deployment.unit.movement`.
   *
   * By default, the instance's current coordinates are used as the
   * given coordinates.
   *
   * Consider using in conjunction with `Deployment.move`.
   */
  getReachableCoords = (fromCoords = this.coordinates.raw) =>
    this.applyMovementOptions(fromCoords).map(Coords.parse)

  /**
   * Get all targetable hostile/wildcard `Deployment`s from a given pair of `RawCoords`,
   * based on the configuration of `Deployment.unit.weapon`.
   *
   * By default, the instance's current coordinates are used as the
   * given coordinates.
   *
   * Consider using in conjunction with `Deployment.engage`.
   */
  getTargetableDeployments = (fromCoords = this.coordinates.raw) => {
    if (!this.unit.weapon) return []

    return (this.unit.weapon
      .getTargetableCoords(this, fromCoords)
      .map(this.grid.getDeployment)
      .filter(Boolean) as unknown) as Deployment<U>[]
  }

  private initGraph() {
    const graph: GraphNodeMap = {}

    this.grid.mapTiles(tile => {
      const nodeNeighbour = this.unit.movement.constraint
        .adjacent(tile.coords)
        .reduce((acc, coords) => {
          if (coords.withinBounds(this.grid)) {
            if (!acc) acc = {}
            const neighbour = this.grid.graph[coords.y][coords.x]
            acc[coords.hash] = neighbour.tile
          }
          return acc
        }, undefined as undefined | GraphNodeNeighbour)
      if (nodeNeighbour) graph[tile.coords.hash] = nodeNeighbour
    })

    this.graph = new Graph(graph)
  }

  private applyMovementOptions = (
    fromCoords = this.coordinates.raw,
    stepsLeft = this.unit.movement.steps,
    accumulator = {
      passThroughCount: 0,
      accessible: new Set<string>(),
      inaccessible: new Set<string>(),
    }
  ) => [
    ...this.unit.movement.constraint
      .adjacent(fromCoords)
      .filter(this.grid.withinBounds)
      .reduce((acc, coordinates) => {
        const {
          canPassThroughOtherUnit,
          unitPassThroughLimit,
        } = this.unit.movement

        if (stepsLeft <= 0 || acc.inaccessible.has(Coords.hash(fromCoords))) {
          return acc
        }

        const { deployment, tile } = this.grid.getCoordinateData(coordinates)!
        const movementCost = tile.cost(this.unit)

        if (movementCost > stepsLeft) return acc

        let didPassThroughUnit = false
        if (deployment?.unit && deployment.unit.id !== this.unit.id) {
          if (!canPassThroughOtherUnit(deployment.unit)) {
            acc.inaccessible.add(coordinates.hash)
            return acc
          }
          didPassThroughUnit = true
          acc.passThroughCount++
        }

        acc.accessible.add(coordinates.hash)
        if (
          stepsLeft - movementCost > 0 &&
          (!didPassThroughUnit || acc.passThroughCount < unitPassThroughLimit)
        ) {
          this.applyMovementOptions(coordinates, stepsLeft - movementCost, acc)
        }

        return acc
      }, accumulator).accessible,
  ]
}
