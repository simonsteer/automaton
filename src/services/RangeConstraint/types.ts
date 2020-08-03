export type RangeConstraintException = (coordinates: RawCoords) => boolean

export type RangeConstraintOffset = (number | [number, number])[]

export type Constraint = {
  offsets: { y: RangeConstraintOffset; x: RangeConstraintOffset }
  exceptions?: RangeConstraintException[]
}
