import { Unit } from '..'

export interface TerrainConfig {
  cost?: (unit: Unit) => number
}
