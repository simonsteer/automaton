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

  private buildGraph() {
    const graph = new Graph()
    this.grid.mapTiles(tile => {
      const neighbours: GraphNodeNeighbour = {}
      this.unit.directionalConstraint
        .adjacent(tile.coords)
        .forEach(({ x, y }) => {
          const neighbour = this.grid.graph[y][x]
          neighbours[neighbour.coords.hash] = neighbour.tile.terrain
        })
      graph.addNode(tile.coords.hash, neighbours)
    })
    return graph
  }
}
