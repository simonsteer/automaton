import { Coords, Pathfinder } from '../../services'
import { Tile } from '..'

export type GridVectorData = { coords: Coords; tile: Tile }

export type GridGraph = GridVectorData[][]

export type GridEvents = {
  addUnits: (pathfinders: Pathfinder[]) => void
  removeUnits: (unitIds: Symbol[]) => void
}
