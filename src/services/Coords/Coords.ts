export default class Coords {
  x: number
  y: number

  constructor({ x, y }: { x: number; y: number }) {
    this.x = x
    this.y = y
  }

  static parseHash(hash: string) {
    const [x, y] = hash.split(',').map(Number)
    return new Coords({ x, y })
  }

  static hash({ x, y }: RawCoords) {
    return `${x},${y}`
  }

  get hash() {
    return Coords.hash(this)
  }

  delta(coordinates: RawCoords) {
    return new Coords({
      x: this.x - coordinates.x,
      y: this.y - coordinates.y,
    })
  }
}
