import { Tile } from '..'
import { Deployment } from '../../services'

export type TileInteractionCallback<D = void> = (
  deployment: Deployment,
  tile: Tile
) => D

export type TileConfig = Partial<{
  shouldGuardEntry: TileInteractionCallback<boolean>
  shouldGuardCrossover: TileInteractionCallback<boolean>
}>

export type TileEvents = {
  unitEnter: TileInteractionCallback
  unitExit: TileInteractionCallback
  unitStop: TileInteractionCallback
  guardEntry: TileInteractionCallback
  guardCrossover: TileInteractionCallback
}
