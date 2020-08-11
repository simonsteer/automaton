import { Pathfinder, Coords } from '..'
import { TileInteractionCallback, Grid, Unit } from '../../entities'
import { graphMergeStrategies, coordinatesHashesMergeStrategies } from './utils'
import Graph from '../Pathfinder/Dijkstra/Graph'
import { RangeConstraintConfig, ConstraintMergeStrategy } from './types'
import Constraint from './Constraint'

export default class RangeConstraint {
  constraints: Constraint[]
  mergeStrategy: ConstraintMergeStrategy
  steps: number
  canPassThroughUnit: TileInteractionCallback<boolean>
  preMerge?: (coordinateHashes: Coords[]) => Coords[]

  constructor({
    constraints = [],
    mergeStrategy = 'union',
    steps = 1,
    preMerge,
    canPassThroughUnit = () => false,
  }: Partial<RangeConstraintConfig>) {
    this.constraints = constraints.map(config => new Constraint(config))
    if (preMerge) this.preMerge = preMerge
    this.mergeStrategy = mergeStrategy
    this.steps = steps
    this.canPassThroughUnit = canPassThroughUnit
  }

  buildPathfinderGraph = (grid: Grid) =>
    new Graph(
      this.mergeGraph(
        ...this.constraints.map(constraint =>
          constraint.buildPathfinderGraph(grid)
        )
      )
    )

  getReachableCoordinates = (pathfinder: Pathfinder) =>
    this.mergeReachableCoordinates(
      ...this.constraints.map(constraint => {
        const hashes = this.getReachableCoordinatesForConstraint({
          unit: pathfinder.unit,
          grid: pathfinder.grid,
          constraint,
          fromCoords: pathfinder.coordinates,
          stepsLeft: this.steps,
        })
        if (this.preMerge) {
          return this.preMerge(Coords.parseMany(hashes)).map(Coords.hash)
        }
        return hashes
      })
    )

  adjacent = (fromCoords: Coords) => [
    ...this.constraints.reduce((acc, constraint) => {
      acc.push(...constraint.adjacent(fromCoords))
      return acc
    }, [] as Coords[]),
  ]

  private get mergeReachableCoordinates() {
    return coordinatesHashesMergeStrategies[this.mergeStrategy]
  }

  private get mergeGraph() {
    return graphMergeStrategies[this.mergeStrategy]
  }

  private getReachableCoordinatesForConstraint = (
    {
      unit,
      grid,
      constraint,
      fromCoords,
      stepsLeft,
    }: {
      unit: Unit
      grid: Grid
      constraint: Constraint
      fromCoords: Coords
      stepsLeft: number
    },
    accumulator = {
      accessible: new Set<string>(),
      inaccessible: new Set<string>(),
    }
  ) => [
    ...constraint
      .adjacent(fromCoords)
      .filter(grid.withinBounds)
      .reduce((acc, coordinates) => {
        if (stepsLeft === 0 || acc.inaccessible.has(fromCoords.hash)) {
          return acc
        }

        const tileData = grid.getData(coordinates)!
        const movementCost = tileData.tile.terrain.cost(unit)
        const tileUnit = tileData.pathfinder?.unit

        if (movementCost > stepsLeft) return acc
        if (tileUnit && !this.canPassThroughUnit(tileUnit)) {
          acc.inaccessible.add(coordinates.hash)
          return acc
        }

        acc.accessible.add(coordinates.hash)
        if (stepsLeft - movementCost > 0) {
          this.getReachableCoordinatesForConstraint(
            {
              unit,
              grid,
              constraint,
              fromCoords: coordinates,
              stepsLeft: stepsLeft - movementCost,
            },
            acc
          )
        }

        return acc
      }, accumulator).accessible,
  ]
}
