import { RawCoords } from '../Coords'
import { TileInteractionCallback } from '../../entities'

export type RangeConstraintException = (coordinates: RawCoords) => boolean

export type RangeConstraintOffset = (number | [number, number])[]

export type ConstraintConfig = {
  offsets: { y: RangeConstraintOffset; x: RangeConstraintOffset }
  exceptions?: RangeConstraintException[]
}

export type ConstraintMergeStrategy = 'union' | 'intersect' | 'difference'

export type RangeConstraintConfig = {
  constraints: ConstraintConfig[]
  mergeStrategy: ConstraintMergeStrategy
  steps: number
  canPassThroughUnit: TileInteractionCallback<boolean>
  unitPassThroughLimit: number
}
