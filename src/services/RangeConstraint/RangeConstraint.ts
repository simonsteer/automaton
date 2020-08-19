import { Coords } from '..'
import { Grid, Unit } from '../../entities'
import { graphMergeStrategies, coordinatesHashesMergeStrategies } from './utils'
import Graph from '../Pathfinder/Dijkstra/Graph'
import { RangeConstraintConfig, ConstraintMergeStrategy } from './types'
import Constraint from './Constraint'

export default class RangeConstraint {
  constraints: Constraint[]
  mergeStrategy: ConstraintMergeStrategy
  steps: number

  constructor({
    constraints = [],
    mergeStrategy = 'union',
    steps = 1,
  }: Partial<RangeConstraintConfig>) {
    this.constraints = constraints.map(config => new Constraint(config))
    this.mergeStrategy = mergeStrategy
    this.steps = steps
  }

  applies = (coordsA: Coords, coordsB: Coords) =>
    this.constraints.every(constraint => constraint.applies(coordsA, coordsB))

  buildPathfinderGraph = (grid: Grid) =>
    new Graph(
      this.mergeGraph(
        ...this.constraints.map(constraint =>
          constraint.buildPathfinderGraph(grid)
        )
      )
    )

  getApplicableCoordinates = (fromCoords: Coords, grid: Grid, unit?: Unit) =>
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
      fromCoords: Coords
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
        if (stepsLeft <= 0 || acc.inaccessible.has(fromCoords.hash)) {
          return acc
        }

        const { pathfinder, tile } = grid.getData(coordinates)!
        const movementCost = unit ? tile.terrain.cost(unit) : 1

        if (movementCost > stepsLeft) return acc

        let didPassThroughUnit = false
        if (unit && pathfinder?.unit && pathfinder.unit.id !== unit.id) {
          if (!unit.pathfinderOptions.canPassThroughUnit(pathfinder, tile)) {
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
            acc.passThroughCount < unit!.pathfinderOptions.unitPassThroughLimit)
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
