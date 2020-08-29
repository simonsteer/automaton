import { Tile } from '..'
import { Deployment, Coords } from '../../services'
import { Unit, RawCoords } from '../..'

export type TileInteractionCallback<D = void> = (
  deployment: Deployment,
  tile: Tile
) => D

export type TileConfig = Partial<{
  cost: (unit: Unit) => number
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
