import { TerrainConfig } from './types'

export default class Terrain {
  readonly id = Symbol()
  cost = (unit: Unit) => 1

  constructor({ cost } = {} as TerrainConfig) {
    if (cost) this.cost = cost
  }
}
