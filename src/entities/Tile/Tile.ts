import { TileConfig, TileInteractionCallback, TileEvents } from './types'
import { Terrain } from '..'
import { TypedEventEmitter } from '../../services'

export default class Tile {
  readonly id = Symbol()

  events = new TypedEventEmitter<TileEvents>()
  shouldGuardEntry = (() => false) as TileInteractionCallback<boolean>
  shouldGuardCrossover = (() => false) as TileInteractionCallback<boolean>

  terrain: Terrain
  constructor(
    terrain: Terrain,
    {
      shouldGuardEntry = () => false,
      shouldGuardCrossover = () => false,
    } = {} as TileConfig
  ) {
    this.terrain = terrain
    this.shouldGuardEntry = shouldGuardEntry
    this.shouldGuardCrossover = shouldGuardCrossover
  }
}
