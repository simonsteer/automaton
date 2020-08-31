import { Tile } from '..'
import { Deployment } from '../../services'
import { Unit } from '../..'

export type TileInteractionCallback<D = void> = <U extends Unit = Unit>(
  deployment: Deployment<U>,
  tile: Tile
) => D

export type TileConfig = Partial<{
  cost: <U extends Unit = Unit>(unit: U) => number
  shouldGuardEntry: TileInteractionCallback<boolean>
  shouldGuardCrossover: TileInteractionCallback<boolean>
}>
