import Coords, { RawCoords } from '../Coords'

export default class DeltaConstraint {
  private deltaMap: { [x: string]: { [y: string]: true } } = {}
  private deltas: RawCoords[]

  constructor(deltas: RawCoords[]) {
    this.deltas = deltas
    deltas.forEach(({ x, y }) => {
      if (!this.deltaMap[x]) this.deltaMap[x] = {}
      this.deltaMap[x][y] = true
    })
  }

  adjacent = (coords: RawCoords) =>
    this.deltas.map(d => new Coords({ x: coords.x + d.x, y: coords.y + d.y }))

  applies = (coordsA: RawCoords, coordsB: RawCoords) => {
    const { x, y } = Coords.deltas(coordsA, coordsB)
    return !!this.deltaMap[x]?.[y]
  }
}
