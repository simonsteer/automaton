import { Coords, Deployment, RawCoords } from '../../services'
import { Tile, Unit } from '..'

export type GridVectorData = { coords: Coords; tile: Tile }

export type GridGraph = GridVectorData[][]

export type GridEvents<U extends Unit = Unit> = {
  unitsDeployed: (deployments: Deployment<U>[]) => void
  unitMovement: (deployment: Deployment<U>, path: RawCoords[]) => void
  unitsWithdrawn: (unitIds: Symbol[]) => void
  unitsEngaged: (deploymentA: Deployment<U>, deploymentB: Deployment<U>) => void
  unitEnterTile: (deployment: Deployment<U>, tile: Tile) => void
  unitExitTile: (deployment: Deployment<U>, tile: Tile) => void
  unitStopTile: (deployment: Deployment<U>, tile: Tile) => void
  guardTileEntry: (deployment: Deployment<U>, tile: Tile) => void
  guardTileCrossover: (deployment: Deployment<U>, tile: Tile) => void
}

export type GridQuery = RawCoords | Symbol
