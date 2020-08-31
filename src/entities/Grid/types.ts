import { Coords, Deployment, RawCoords } from '../../services'
import { Tile, Unit } from '..'

export type GridVectorData = { coords: Coords; tile: Tile }

export type GridGraph = GridVectorData[][]

export type GridEvents<U extends Unit = Unit> = {
  unitsDeployed: (deployments: Deployment<U>[]) => void
  unitMovement: (deployment: Deployment<U>, path: RawCoords[]) => void
  unitsWithdrawn: (unitIds: Symbol[]) => void
  unitsEngaged: (deploymentA: Deployment<U>, deploymentB: Deployment<U>) => void
}

export type GridQuery = RawCoords | Symbol
