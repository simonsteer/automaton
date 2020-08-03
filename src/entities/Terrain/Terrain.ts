import { TerrainConfig } from './types'

export default class Terrain {
  readonly id = Symbol()
  cost = (unit: Unit) => 1
  cache = new Map<Symbol, number>()

  constructor({ cost } = {} as TerrainConfig) {
    if (cost) this.cost = cost
  }
}
