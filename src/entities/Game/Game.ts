import Weapon from '../Weapon'
import { Terrain } from '..'
import Tile from '../Tile'
import { BattleManager } from '../../services'

const defaultTerrain = new Terrain()
const defaultTile = new Tile(defaultTerrain)
const defaultWeapon = new Weapon()

export default class Game {
  readonly id = Symbol()
  static defaults = {
    terrain: defaultTerrain,
    tile: defaultTile,
    weapon: defaultWeapon,
  }

  startBattle(grid: Grid) {
    const iterator = this.__startBattle(grid)
  }

  private __startBattle(grid: Grid) {
    const battle = new BattleManager(grid)
    const generator = battle.start()
    return generator.next(generator)
  }
}
