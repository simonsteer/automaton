import Unit from '../Unit'
import Tile from '../Tile'
import Team from '../Team'
import Deployment from '../Deployment'
import Coords from '../../services/Coords'

export default class Grid {
  constructor(
    options: Partial<{
      tiles: Tile[][]
      units: [Unit, { x: number; y: number }][]
    }>
  )
  id: string
  deployments: Deployment[]
  timestamp: number
  size: { width: number; height: number }
  teams(): Team[]
  tile_at(coordinates: { x: number; y: number }): Tile | undefined
  map_tiles<
    C extends (data: { coords: Coords; tile: Tile }) => any
  >(): ReturnType<C>
  out_of_bounds(coordinates: { x: number; y: number }): boolean
  within_bounds(coordinates: { x: number; y: number }): boolean
  deploy_unit(unit: Unit, coordinates: { x: number; y: number }): void
  deploy_units(units: [Unit, { x: number; y: number }][]): void
  withdraw_deployment(deployment: Deployment): Grid
  withdraw_deployments(deployments: Deployment[]): Grid
  find_deployment(
    query: { x: number; y: number } | string
  ): Deployment | undefined
  find_deployments(queries: ({ x: number; y: number } | string)[]): Deployment[]
}
