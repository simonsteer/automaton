import { Game } from './entities'

export function createSimpleGraph(size: number) {
  return Array(size)
    .fill(Game.defaults.tile)
    .map(t => Array(size).fill(t)) as Tile[][]
}

export function mapGraph<T, R>(
  graph: T[][],
  callback: (item: T, coordinates: RawCoords) => R
) {
  return graph.map((row, y) => row.map((item, x) => callback(item, { x, y })))
}
