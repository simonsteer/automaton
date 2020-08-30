import { RawCoords } from '../Coords'
import { TileInteractionCallback } from '../../entities'

export type RangeConstraintException = (coordinates: RawCoords) => boolean

export type RangeConstraintOffset = (number | [number, number])[]

export type ConstraintConfig = {
  offsets: { y: RangeConstraintOffset; x: RangeConstraintOffset }
  exceptions?: RangeConstraintException[]
}

export type ConstraintMergeStrategyType = 'union' | 'intersect' | 'difference'

export type RangeConstraintConfig = {
  constraints: ConstraintConfig[]
  mergeStrategy: ConstraintMergeStrategyType
}

export type GetReachableCooordinatesOptions = {
  canPassThroughUnit: TileInteractionCallback<boolean>
  unitPassThroughLimit: number
}
