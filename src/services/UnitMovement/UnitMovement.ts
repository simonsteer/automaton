import { ConstraintMergeStrategy, UnitMovementConfig } from './types'
import { RangeConstraint } from '..'
import { TileInteractionCallback } from '../../entities'
import * as mergeStrategies from './utils'

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
    this.merge(
      ...this.constraints.map(constraint =>
        constraint.buildPathfinderGraph(grid)
      )
    )

  private get merge() {
    return mergeStrategies[this.mergeStrategy]
  }
}
