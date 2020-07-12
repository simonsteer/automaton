import Base from '../Base'
import { GridGraph } from './types'
import { mapGraph } from '../../utils'
import { Coords } from '../../services'

export default class Grid extends Base {
  graph: GridGraph
  constructor(graph: Tile[][]) {
    super()
    this.graph = mapGraph(graph, (tile, { x, y }) => ({
      coords: new Coords({ x, y }),
      tile,
    }))
  }
}
