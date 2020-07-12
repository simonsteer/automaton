import Base from '../Base'

export default class Tile extends Base {
  terrain: Terrain
  constructor(terrain: Terrain) {
    super()
    this.terrain = terrain
  }
}
