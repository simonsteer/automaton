import { Coords } from '..'
import { Grid, Unit } from '../../entities'
import { graphMergeStrategies, coordinatesHashesMergeStrategies } from './utils'
import Graph from '../Deployment/Dijkstra/Graph'
import { RangeConstraintConfig, ConstraintMergeStrategyType } from './types'
import Constraint from './Constraint'
import { RawCoords } from '../..'

export default class RangeConstraint {
  private constraints: Constraint[]
  private mergeStrategy: ConstraintMergeStrategyType
  private steps: number

  constructor({
    constraints = [],
    mergeStrategy = 'union',
    steps = 1,
  }: Partial<RangeConstraintConfig>) {
    this.constraints = constraints.map(config => new Constraint(config))
    this.mergeStrategy = mergeStrategy
    this.steps = steps
  }

  /**
   *
   * @function
   * Check to see if the deltas between coordsA and coordsB
   */
  applies = (coordsA: RawCoords, coordsB: RawCoords) =>
    this.constraints.every(constraint => {
      constraint.applies(coordsA, coordsB)
    })

  private buildDeploymentGraph = (grid: Grid) =>
    new Graph(
      this.mergeGraph(
        ...this.constraints.map(constraint =>
          constraint['buildDeploymentGraph'](grid)
        )
      )
    )

  getApplicableCoordinates = (fromCoords: RawCoords, grid: Grid, unit?: Unit) =>
    this.mergeReachableCoordinates(
      ...this.constraints.map(constraint =>
        this.getReachableCoordinatesForConstraint({
          unit,
          grid,
          constraint,
          fromCoords,
          stepsLeft: this.steps,
        })
      )
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
      unit?: Unit
      grid: Grid
      constraint: Constraint
      fromCoords: RawCoords
      stepsLeft: number
    },
    accumulator = {
      passThroughCount: 0,
      accessible: new Set<string>(),
      inaccessible: new Set<string>(),
    }
  ) => [
    ...constraint
      .adjacent(fromCoords)
      .filter(grid.withinBounds)
      .reduce((acc, coordinates) => {
        if (stepsLeft <= 0 || acc.inaccessible.has(Coords.hash(fromCoords))) {
          return acc
        }

        const { deployment, tile } = grid.getCoordinateData(coordinates)!
        const movementCost = unit ? tile.cost(unit) : 1

        if (movementCost > stepsLeft) return acc

        let didPassThroughUnit = false
        if (unit && deployment?.unit && deployment.unit.id !== unit.id) {
          if (!unit.extraMovementOptions.canPassThroughUnit(deployment, tile)) {
            acc.inaccessible.add(coordinates.hash)
            return acc
          }
          didPassThroughUnit = true
          acc.passThroughCount++
        }

        acc.accessible.add(coordinates.hash)
        if (
          stepsLeft - movementCost > 0 &&
          (!didPassThroughUnit ||
            acc.passThroughCount <
              unit!.extraMovementOptions.unitPassThroughLimit)
        ) {
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
