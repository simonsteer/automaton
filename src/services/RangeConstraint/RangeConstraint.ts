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

  constructor({
    constraints = [],
    mergeStrategy = 'union',
  }: Partial<RangeConstraintConfig>) {
    this.constraints = constraints.map(config => new Constraint(config))
    this.mergeStrategy = mergeStrategy
  }

  /**
   *
   * Check to see if the deltas between coordsA and coordsB
   */
  applies = (coordsA: RawCoords, coordsB: RawCoords) =>
    this.constraints.every(constraint => {
      constraint.applies(coordsA, coordsB)
    })

  private buildDeploymentGraph = <U extends Unit = Unit>(grid: Grid<U>) =>
    new Graph(
      this.mergeGraph(
        ...this.constraints.map(constraint =>
          constraint['buildDeploymentGraph'](grid)
        )
      )
    )

  getApplicableCoordinates = <U extends Unit = Unit>(
    fromCoords: RawCoords,
    grid: Grid<U>,
    getCoordinates = (constraint: Constraint) =>
      constraint
        .adjacent(fromCoords)
        .filter(grid.withinBounds)
        .map(c => c.hash)
  ) => this.mergeHashSets(...this.constraints.map(getCoordinates))

  adjacent = (fromCoords: Coords) => [
    ...this.constraints.reduce((acc, constraint) => {
      acc.push(...constraint.adjacent(fromCoords))
      return acc
    }, [] as Coords[]),
  ]

  private get mergeHashSets() {
    return coordinatesHashesMergeStrategies[this.mergeStrategy]
  }

  private get mergeGraph() {
    return graphMergeStrategies[this.mergeStrategy]
  }
}
