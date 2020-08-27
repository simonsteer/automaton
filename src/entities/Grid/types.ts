import { Coords, Pathfinder, RawCoords } from '../../services'
import { Tile } from '..'

export type GridVectorData = { coords: Coords; tile: Tile }

export type GridGraph = GridVectorData[][]

export type GridEvents = {
  addUnits: (pathfinders: Pathfinder[]) => void
  unitMovement: (pathfinder: Pathfinder, path: RawCoords[]) => void
  removeUnits: (unitIds: Symbol[]) => void
}
