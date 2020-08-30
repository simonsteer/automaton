import { Coords, Deployment, RawCoords } from '../../services'
import { Tile } from '..'

export type GridVectorData = { coords: Coords; tile: Tile }

export type GridGraph = GridVectorData[][]

export type GridEvents = {
  unitsDeployed: (deployments: Deployment[]) => void
  unitMovement: (deployment: Deployment, path: RawCoords[]) => void
  unitsWithdrawn: (unitIds: Symbol[]) => void
  unitsEngaged: (deploymentA: Deployment, deploymentB: Deployment) => void
}

export type GridQuery = RawCoords | Symbol
