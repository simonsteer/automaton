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

  get = {
    reachableCoordinates: () => {
      const reachable = new Set<string>()

      const checkAdjacentTiles = (coordinates: Coords, stepsLeft: number) => {
        const adjacent = this.unit.directionalConstraint.adjacent(coordinates)
        adjacent.forEach(coordinates => {
          if (this.coordinates.hash === coordinates.hash) return

          const { tile } = this.grid.get.data(coordinates) || {}
          if (!tile) return

          const tileCost = tile.terrain.cost(this.unit)
          if (tileCost > stepsLeft) return
          if (!reachable.has(coordinates.hash)) reachable.add(coordinates.hash)
          if (stepsLeft - tileCost > 0)
            checkAdjacentTiles(coordinates, stepsLeft - tileCost)
        })
      }
      checkAdjacentTiles(this.coordinates, this.unit.get.stats().movement)

      return [...reachable].map(Coords.parse)
    },
  }

  private buildGraph() {
    const graph = new Graph()
    this.grid.mapTiles(tile => {
      const neighbours: GraphNodeNeighbour = {}
      this.unit.directionalConstraint
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
