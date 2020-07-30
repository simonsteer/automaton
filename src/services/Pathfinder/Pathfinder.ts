import Coords from '../Coords'
import Graph from './Dijkstra/Graph'
import { GraphNodeNeighbour } from './Dijkstra/types'

export default class Pathfinder {
  readonly grid: Grid
  readonly unit: Unit
  readonly graph: Graph
  private _coordinates: Coords

  constructor({
    grid,
    unit,
    coordinates,
  }: {
    grid: Grid
    unit: Unit
    coordinates: RawCoords
  }) {
    this.grid = grid
    this.unit = unit
    this._coordinates = new Coords(coordinates)
    this.graph = this.buildGraph()
  }

  get coordinates() {
    return this._coordinates
  }

  move = (path: RawCoords[]) => {
    if (path.length < 1) {
      return this
    }

    return path.reduce(
      (acc, coordinates, index) => {
        if (acc.abort) {
          return acc
        }

        const data = this.grid.get.data(coordinates)
        if (!data) {
          throw new Error(
            `No data was found at coordinates: { x: ${coordinates.x}; y: ${coordinates.y} }`
          )
        }

        const prevCoords = path[index - 1] as RawCoords | undefined
        if (prevCoords) {
          const prevData = this.grid.get.data(coordinates)!
          const { tile: prevTile } = prevData
          prevTile.onUnitExit(this.unit)
        }

        const { unit: otherUnit, tile } = data
        const {
          onUnitEnter,
          onUnitStop,
          shouldEndRouteBeforeEnter,
          shouldEndRouteAfterEnter,
        } = tile

        if (shouldEndRouteBeforeEnter(this.unit)) {
          acc.abort = true
          return acc
        } else {
          acc.path.push(coordinates)
          onUnitEnter(this.unit)

          if (!otherUnit && shouldEndRouteAfterEnter(this.unit)) {
            acc.abort = true
          }

          onUnitStop(this.unit)
        }

        return acc
      },
      { path: [] as RawCoords[], abort: false }
    )
  }

  get = {
    route: (toCoords: RawCoords) => {
      const result = this.graph.path(
        this.unit,
        this.coordinates.hash,
        Coords.hash(toCoords),
        { cost: true }
      ) as { path: null | string[]; cost: number }

      return result.path?.map(Coords.parse).slice(1)
    },
    reachable: (
      fromCoords = this.coordinates,
      stepsLeft = this.unit.movement.steps,
      accumulator = new Set<string>()
    ) =>
      [
        ...this.unit.movement.pattern
          .adjacent(fromCoords)
          .reduce((acc, coordinates) => {
            if (this.coordinates.hash === coordinates.hash) return acc

            const { tile } = this.grid.get.data(coordinates) || {}
            if (!tile) return acc

            const tileCost = tile.terrain.cost(this.unit)
            if (tileCost > stepsLeft) return acc

            if (!acc.has(coordinates.hash)) acc.add(coordinates.hash)
            if (stepsLeft - tileCost > 0)
              this.get.reachable(coordinates, stepsLeft - tileCost, acc)

            return acc
          }, accumulator),
      ].map(Coords.parse),
  }

  private buildGraph() {
    const graph = new Graph()
    this.grid.mapTiles(tile => {
      const neighbours: GraphNodeNeighbour = {}
      this.unit.movement.pattern
        .adjacent(tile.coords)
        .filter(coords => coords.withinBounds(this.grid))
        .forEach(({ x, y }) => {
          const neighbour = this.grid.graph[y]?.[x]
          if (neighbour) {
            neighbours[neighbour.coords.hash] = neighbour.tile.terrain
          }
        })
      graph.addNode(tile.coords.hash, neighbours)
    })
    return graph
  }
}
