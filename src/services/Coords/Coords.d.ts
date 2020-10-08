import Grid from '../../entities/Grid'

export default class Coords {
  constructor(coordinates: { x: number; y: number })
  raw: { x: number; y: number }
  x: number
  y: number
  static hash(coordinates: { x: number; y: number }): string
  static hash_many(coordinates: { x: number; y: number }[]): string[]
  hash: string
  static parse(hash: string): Coords
  static parse_many(hashes: string[]): Coords[]
  static deltas(
    coords_a: { x: number; y: number },
    coords_b: { x: number; y: number }
  ): { x: number; y: number }
  static match(
    coords_a: { x: number; y: number },
    coords_b: { x: number; y: number }
  ): boolean
  match(other_coords: { x: number; y: number }): boolean
  deltas(coordinates: { x: number; y: number }): { x: number; y: number }
  within_bounds(grid: Grid): boolean
  out_of_bounds(grid: Grid): boolean
  update(updates: Partial<{ x: number; y: number }>): Coords
}
