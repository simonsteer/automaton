import { RawCoords } from './services'
import { Tile } from './entities'

export function createSimpleGraph(size: number) {
  const tile = new Tile()
  return Array(size)
    .fill(tile)
    .map(t => Array(size).fill(t)) as Tile[][]
}

export function mapTiles<T, R>(
  graph: T[][],
  callback: (item: T, coordinates: RawCoords) => R
) {
  return graph.map((row, y) => row.map((item, x) => callback(item, { x, y })))
}
