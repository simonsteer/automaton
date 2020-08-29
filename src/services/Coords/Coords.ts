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

  /**
   * Returns the x & y deltas for a pair of given coordinates.
   * */
  static deltas(coordsA: RawCoords, coordsB: RawCoords) {
    return {
      x: coordsA.x - coordsB.x,
      y: coordsA.y - coordsB.y,
    }
  }

  /**
   * Returns a hashed value of the given coordinates in the form of a `string`.
   * */
  static hash({ x, y }: RawCoords) {
    return `${x},${y}`
  }

  /**
   * Used to parse coordinates that have been hashed by `Coords.hash`.
   * Returns a `Coords` instance.
   * */
  static parse(hash: string): Coords {
    const [x, y] = hash.split(',').map(Number)
    return new Coords({ x, y })
  }

  /**
   * Returns a hashed value of many given coordinates in the form of `string`s.
   * */
  static hashMany(coords: RawCoords[]): string[] {
    return coords.map(Coords.hash)
  }

  /**
   * Used to parse many coordinates that have been hashed by `Coords.hash`.
   * Returns an array of `Coords` instances.
   * */
  static parseMany(hashes: string[]): Coords[] {
    return hashes.map(Coords.parse)
  }

  /**
   * @getter
   * Returns a snapshot of the current x and y values of the `Coords` instance.
   * */
  get raw() {
    return { x: this.x, y: this.y }
  }

  /**
   * @getter
   * Returns the hash of the current `Coords` instance x and y values, using
   * the static `hash` method.
   * */
  get hash() {
    return Coords.hash(this)
  }

  /**
   * Returns the x & y deltas between the instance's coordinates and the given coordinates.
   * */
  deltas(coordinates: RawCoords) {
    return Coords.deltas(this, coordinates)
  }

  /**
   * Determines whether the `Coords` instance is considered outside the bounds of
   * the given `Grid`
   * */
  outOfBounds = (grid: Grid) =>
    this.x < 0 || this.y < 0 || this.x >= grid.size.x || this.y >= grid.size.y

  /**
   * Determines whether the `Coords` instance is considered within the bounds of
   * the given `Grid`
   * */
  withinBounds = (grid: Grid) => !this.outOfBounds(grid)

  /**
   * Updates the x & y values of the `Coords` instance.
   * */
  update = ({ x = this.x, y = this.y }: Partial<{ x: number; y: number }>) => {
    this._y = y
    this._x = x
    return this
  }
}
