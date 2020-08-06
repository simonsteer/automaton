import { ConstraintMergeStrategy, UnitMovementConfig } from './types'
import { RangeConstraint, Pathfinder, Coords } from '..'
import { TileInteractionCallback, Grid, Unit } from '../../entities'
import { graphMergeStrategies, coordinatesHashesMergeStrategies } from './utils'
import Graph from '../Pathfinder/Dijkstra/Graph'

export default class UnitMovement {
  constraints: RangeConstraint[]
  mergeStrategy: ConstraintMergeStrategy
  steps: number
  canPassThroughUnit: TileInteractionCallback<boolean>

  constructor({
    constraints,
    mergeStrategy,
    steps,
    canPassThroughUnit,
  }: UnitMovementConfig) {
    this.constraints = constraints.map(config => new RangeConstraint(config))
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
      ...this.constraints.map(constraint =>
        this.getReachableCoordinatesForConstraint({
          unit: pathfinder.unit,
          grid: pathfinder.grid,
          constraint,
          fromCoords: pathfinder.coordinates,
          stepsLeft: this.steps,
        })
      )
    )

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
      constraint: RangeConstraint
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
