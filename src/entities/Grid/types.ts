import { Coords } from '../../services'
import { Tile } from '..'

export type GridVectorData = { coords: Coords; tile: Tile }

export type GridGraph = GridVectorData[][]
