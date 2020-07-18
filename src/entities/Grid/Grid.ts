import { GridGraph, GraphData } from './types'
import { mapGraph } from './utils'
import Base from '../Base'
import { Coords } from '../../services'

export default class Grid extends Base {
  graph: GridGraph
  constructor(game: Game, graph: Tile[][]) {
    super(game, 'grid')
    this.graph = mapGraph(graph, (tile, { x, y }) => ({
      coords: new Coords({ x, y }),
      tile,
    }))
  }

  mapTiles<R>(callback: (item: GraphData, coordinates: RawCoords) => R) {
    return mapGraph(this.graph, callback)
  }
}
