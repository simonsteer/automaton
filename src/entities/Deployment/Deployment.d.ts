import Coords from '../../services/Coords'
import Grid from '../Grid'
import Unit from '../Unit'
import Tile from '../Tile'

export default class Deployment {
  constructor(options: {
    grid: Grid
    unit: Unit
    coordinates: { x: number; y: number }
  })
  id: string
  grid: Grid
  unit: Unit
  tile: Tile
  coordinates: Coords
  actions_taken: number
  set_coordinates(coordinates: { x: number; y: number }): void
  get_route(config: {
    from?: { x: number; y: number }
    to: { x: number; y: number }
  }): { x: number; y: number }[]
  reachable_coords(from?: { x: number; y: number }): { x: number; y: number }[]
  move(path: { x: number; y: number }[]): { x: number; y: number }[]
  engage(deployment: Deployment): void
  targetable_deployments(from: { x: number; y: number }): Deployment[]
}
