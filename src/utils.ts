import { RawCoords } from './services'
import { Tile } from './entities'
import { DEFAULT_TILE } from './defaults'

export function createSimpleGraph(size: number) {
  return Array(size)
    .fill(DEFAULT_TILE)
    .map(t => Array(size).fill(t)) as Tile[][]
}

export function mapGraph<T, R>(
  graph: T[][],
  callback: (item: T, coordinates: RawCoords) => R
) {
  return graph.map((row, y) => row.map((item, x) => callback(item, { x, y })))
}
