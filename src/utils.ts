import { Terrain, Tile, Grid } from './entities'

export function patchObjectFunctionCalls<
  F extends { [key: string]: (...args: any[]) => any }
>(obj: F, { pre = () => {}, post = () => {} } = {}) {
  const result = {} as { [key: string]: (...args: any[]) => any }
  for (const prop in obj) {
    result[prop] = (...args: any[]) => {
      pre()
      const val = obj[prop](...args)
      post()
      return val
    }
  }
  return result as F
}

export function createSimpleGraph(game: Game, size: number) {
  const terrain = new Terrain(game)
  const tile = new Tile(terrain)

  return Array(size)
    .fill(tile)
    .map(t => Array(size).fill(t)) as Tile[][]
}
