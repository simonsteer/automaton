import { RangeConstraintConfig } from '../RangeConstraint/types'
import { ConstraintMergeStrategy } from './types'
import { RangeConstraint } from '..'
import Graph from '../Pathfinder/Dijkstra/Graph'
import { GraphNodeNeighbour } from '../Pathfinder/Dijkstra/types'

export default class UnitMovement {
  constraints: RangeConstraint[]
  strategy: ConstraintMergeStrategy

  constructor({
    constraints,
    strategy,
  }: {
    constraints: RangeConstraintConfig[]
    strategy: ConstraintMergeStrategy
  }) {
    this.constraints = constraints.map(config => new RangeConstraint(config))
    this.strategy = strategy
  }
}
