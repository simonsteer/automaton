import Coords from '../Coords'
import Graph from 'node-dijkstra'
import { mapGraph } from '../../utils'

export default class Pathfinder {
  grid: Grid
  unit: Unit
  coordinates: Coords
  constructor(grid: Grid, unit: Unit, coordinates: RawCoords) {
    this.grid = grid
    this.unit = unit
    this.coordinates = new Coords(coordinates)
  }

  buildGraph() {
    const graph = new Graph()
    mapGraph(this.grid.graph, ({ coords, tile }) => {})
    return graph
  }
}
