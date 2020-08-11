import Coords, { RawCoords } from '../Coords'
import { Unit } from '../../entities'
import { RangeConstraint } from '..'

export type RangeConstraintException = (coordinates: RawCoords) => boolean

export type RangeConstraintOffset = (number | [number, number])[]

export type ConstraintConfig = {
  offsets: { y: RangeConstraintOffset; x: RangeConstraintOffset }
  exceptions?: RangeConstraintException[]
}

export type ConstraintMergeStrategy = 'union' | 'intersect' | 'difference'

export type RangeConstraintConfig = {
  constraints: ConstraintConfig[]
  preMerge?: RangeConstraint['preMerge']
  mergeStrategy: ConstraintMergeStrategy
  steps: number
  canPassThroughUnit: (otherUnit: Unit) => boolean
}
