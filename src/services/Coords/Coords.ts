import { Grid } from '../../entities'

export type RawCoords = { x: number; y: number }

export default class Coords {
  private _x: number
  private _y: number

  constructor({ x, y }: { x: number; y: number }) {
    this._x = x
    this._y = y
  }

  get x() {
    return this._x
  }

  get y() {
    return this._y
  }

  static hash({ x, y }: RawCoords) {
    return `${x},${y}`
  }

  static deltas(coordsA: RawCoords, coordsB: RawCoords) {
    return {
      x: coordsA.x - coordsB.x,
      y: coordsA.y - coordsB.y,
    }
  }

  static parse(hash: string): Coords {
    const [x, y] = hash.split(',').map(Number)
    return new Coords({ x, y })
  }

  static hashMany(coords: RawCoords[]): string[] {
    return coords.map(Coords.hash)
  }

  static parseMany(hashes: string[]): Coords[] {
    return hashes.map(Coords.parse)
  }

  get raw() {
    return { x: this.x, y: this.y }
  }

  get hash() {
    return Coords.hash(this)
  }

  deltas(coordinates: RawCoords) {
    return Coords.deltas(this, coordinates)
  }

  outOfBounds = (grid: Grid) =>
    this.x < 0 || this.y < 0 || this.x >= grid.size.x || this.y >= grid.size.y

  withinBounds = (grid: Grid) => !this.outOfBounds(grid)

  update = ({ x = this.x, y = this.y }: Partial<{ x: number; y: number }>) => {
    this._y = y
    this._x = x
    return this
  }
}
