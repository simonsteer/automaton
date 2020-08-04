export type RangeConstraintException = (coordinates: RawCoords) => boolean

export type RangeConstraintOffset = (number | [number, number])[]

export type RangeConstraintConfig = {
  offsets: { y: RangeConstraintOffset; x: RangeConstraintOffset }
  exceptions?: RangeConstraintException[]
}
