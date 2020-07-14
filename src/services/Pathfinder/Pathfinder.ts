import Coords from '../Coords'
import Graph from '../Dijkstra/Graph'
import { mapGraph } from '../../utils'
import { GraphNodeNeighbour } from '../Dijkstra/types'

export default class Pathfinder {
  grid: Grid
  unit: Unit
  coordinates: Coords
  graph: Graph

  constructor(grid: Grid, unit: Unit, coordinates: RawCoords) {
    this.grid = grid
    this.unit = unit
    this.coordinates = new Coords(coordinates)
    this.graph = this.buildGraph()
  }

  private buildGraph() {
    const graph = new Graph()
    mapGraph(this.grid.graph, tile => {
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
