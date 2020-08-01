import { Grid, Terrain, Tile } from '../../entities'

export default class Board extends Grid {
  constructor(game: Game) {
    const terrain = new Terrain(game)
    const tile = new Tile(terrain)

    const graph: Tile[][] = [Array(8).fill(Array(8).fill(tile))]

    super(game, { graph, units: [] })
  }
}
