import { Tile } from '..'
import { Deployment, Coords } from '../../services'
import { Unit, RawCoords } from '../..'

export type TileInteractionCallback<D = void> = <U extends Unit = Unit>(
  deployment: Deployment<U>,
  tile: Tile
) => D

export type TileConfig = Partial<{
  cost: <U extends Unit = Unit>(unit: U) => number
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
