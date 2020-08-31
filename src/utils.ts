import { RawCoords } from './services'
import { Tile } from './entities'

export function createSimpleGraph(size: number) {
  const tile = new Tile()
  return Array(size)
    .fill(tile)
    .map(t => Array(size).fill(t)) as Tile[][]
}
