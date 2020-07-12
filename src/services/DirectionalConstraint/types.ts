type ConstraintException = (coordinates: RawCoords) => boolean

type ConstraintRange = (number | [number, number])[]

export type Constraint = {
  offsets: { y: ConstraintRange; x: ConstraintRange }
  exceptions?: ConstraintException[]
}
