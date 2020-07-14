import Base from '../Base'

export default class Tile extends Base {
  terrain: Terrain
  constructor(game: Game, terrain: Terrain) {
    super(game)
    this.terrain = terrain
  }
}
