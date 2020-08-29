import { Tile } from '../../../entities'

export type DeepMap = Map<string, Tile | DeepMap>

export type GraphNodeNeighbour = { [neighbour: string]: Tile }

export type GraphNodeMap = { [node: string]: GraphNodeNeighbour }
