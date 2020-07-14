export default class Coords {
  x: number
  y: number

  constructor({ x, y }: { x: number; y: number }) {
    this.x = x
    this.y = y
  }

  static hash({ x, y }: RawCoords) {
    return `${x},${y}`
  }

  get hash() {
    return Coords.hash(this)
  }

  deltas(coordinates: RawCoords) {
    return new Coords({
      x: this.x - coordinates.x,
      y: this.y - coordinates.y,
    })
  }
}
