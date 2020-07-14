export type DeepMap = Map<string, Terrain | DeepMap>

export type GraphNodeNeighbour = { [neighbour: string]: Terrain }

export type GraphNodeMap = { [node: string]: GraphNodeNeighbour }
