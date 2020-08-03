import Weapon from '../Weapon'
import { EventEmitter } from 'events'
import { Terrain } from '..'
import Tile from '../Tile'
import { BattleManager, TurnManager } from '../../services'
import { GameEvents } from './types'

const defaultTerrain = new Terrain()
const defaultTile = new Tile(defaultTerrain)
const defaultWeapon = new Weapon()

export default class Game {
  readonly id = Symbol()
  private emitter = new EventEmitter()
  static defaults = {
    terrain: defaultTerrain,
    tile: defaultTile,
    weapon: defaultWeapon,
  }

  on<EventName extends keyof GameEvents>(
    event: EventName,
    callback: GameEvents[EventName]
  ) {
    this.emitter.on(event, callback)
    return this
  }

  off<EventName extends keyof GameEvents>(
    event: EventName,
    callback: GameEvents[EventName]
  ) {
    this.emitter.off(event, callback)
    return this
  }

  startBattle(grid: Grid) {
    const generator = this.__startBattle(grid)
    const iterator = generator.next()
    const value = iterator.value
  }

  private emit<EventName extends keyof GameEvents>(
    event: EventName,
    ...args: Parameters<GameEvents[EventName]>
  ) {
    this.emitter.emit(event, ...args)
  }

  private *__startBattle(grid: Grid) {
    const battle = new BattleManager(grid)
    yield* battle.start()
    return null
  }
}
