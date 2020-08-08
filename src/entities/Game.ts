import Weapon from './Weapon'
import Terrain from './Terrain'
import Tile from './Tile'
import BattleManager from '../services/BattleManager'
import { Grid } from '.'

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
}
