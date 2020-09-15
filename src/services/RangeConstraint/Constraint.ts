import range from 'lodash/range'
import { ConstraintConfig } from './types'
import Coords, { RawCoords } from '../Coords'
import { GraphNodeNeighbour, GraphNodeMap } from '../Deployment/Dijkstra/types'
import { Grid, Unit } from '../../entities'

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

  applies = (coordsA: RawCoords, coordsB: RawCoords) => {
    const deltas = Coords.deltas(coordsA, coordsB)
    return (
      !this.constraint.exceptions ||
      this.constraint.exceptions.every(exception => exception(deltas))
    )
  }

  /**
   * get coordinates considered adjacent to the coordinates passed in
   */
  adjacent = (coordsA: RawCoords) => {
    if (!this.cache.adjacent[Coords.hash(coordsA)]) {
      const adjacent: RawCoords[] = []
      for (const xOffset of this.offsets.x) {
        for (const yOffset of this.offsets.y) {
          const coordsB = {
            x: coordsA.x + xOffset,
            y: coordsA.y + yOffset,
          }
          if (this.applies(coordsA, coordsB)) adjacent.push(coordsB)
        }
      }
      this.cache.adjacent[Coords.hash(coordsA)] = adjacent.map(
        c => new Coords(c)
      )
    }
    return this.cache.adjacent[Coords.hash(coordsA)]
  }

  private buildDeploymentGraph = <U extends Unit = Unit>(grid: Grid<U>) => {
    const graph: GraphNodeMap = {}

    grid.mapTiles(tile => {
      const nodeNeighbour = this.adjacent(tile.coords).reduce((acc, coords) => {
        if (coords.withinBounds(grid)) {
          if (!acc) acc = {}
          const neighbour = grid.graph[coords.y][coords.x]
          acc[coords.hash] = neighbour.tile
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
