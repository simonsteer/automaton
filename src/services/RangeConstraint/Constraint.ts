import range from 'lodash/range'
import { ConstraintConfig } from './types'
import Coords, { RawCoords } from '../Coords'
import { GraphNodeNeighbour, GraphNodeMap } from '../Pathfinder/Dijkstra/types'
import { Grid } from '../../entities'

export default class Constraint {
  private cache: { adjacent: { [hash: string]: Coords[] } } = { adjacent: {} }
  private constraint: ConstraintConfig
  private offsets = {
    x: new Set<number>(),
    y: new Set<number>(),
  }

  constructor(constraint: ConstraintConfig) {
    this.constraint = constraint
    this.offsets = this.buildOffsets()
  }

  /**
   * get coordinates considered adjacent to the coordinates passed in
   */
  adjacent = (coordsA: Coords) => {
    if (!this.cache.adjacent[coordsA.hash]) {
      const coordinates: Coords[] = []
      for (const xOffset of this.offsets.x) {
        for (const yOffset of this.offsets.y) {
          const coordsB = {
            x: coordsA.x + xOffset,
            y: coordsA.y + yOffset,
          }
          const deltas = coordsA.deltas(coordsB)
          if (
            !this.constraint.exceptions ||
            this.constraint.exceptions.every(exception => exception(deltas))
          ) {
            coordinates.push(new Coords(coordsB))
          }
        }
      }
      this.cache.adjacent[coordsA.hash] = coordinates
    }

    return this.cache.adjacent[coordsA.hash]
  }

  buildPathfinderGraph = (grid: Grid) => {
    const graph: GraphNodeMap = {}

    grid.mapTiles(tile => {
      const nodeNeighbour = this.adjacent(tile.coords).reduce((acc, coords) => {
        if (coords.withinBounds(grid)) {
          if (!acc) acc = {}
          const neighbour = grid.graph[coords.y][coords.x]
          acc[coords.hash] = neighbour.tile.terrain
        }
        return acc
      }, undefined as undefined | GraphNodeNeighbour)
      if (nodeNeighbour) graph[tile.coords.hash] = nodeNeighbour
    })

    return graph
  }

  private buildOffsets = () =>
    (['x', 'y'] as const).reduce(
      (acc, key) => {
        this.constraint.offsets[key].forEach(offset => {
          const offsetRange = Array.isArray(offset)
            ? range(offset[0], offset[1] + 1)
            : [offset]

          offsetRange.forEach(value =>
            acc[key as keyof ConstraintConfig['offsets']].add(value)
          )
        })
        return acc
      },
      { x: new Set<number>(), y: new Set<number>() }
    )
}
