import { Terrain, Tile } from './entities'

export function createSimpleGraph(size: number) {
  const terrain = new Terrain()
  const tile = new Tile(terrain)

  return Array(size)
    .fill(tile)
    .map(t => Array(size).fill(t)) as Tile[][]
}

export function mapGraph<T, R>(
  graph: T[][],
  callback: (item: T, coordinates: RawCoords) => R
) {
  return graph.map((row, y) => row.map((item, x) => callback(item, { x, y })))
}
