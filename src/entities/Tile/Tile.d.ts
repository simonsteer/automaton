import Unit from '../Unit'
import Deployment from '../Deployment'

export default class Tile {
  constructor(
    options?: Partial<{
      should_guard_entry: (unit: Unit) => boolean
      should_guard_crossover: (unit: Unit) => boolean
      cost: (unit: Unit) => number
    }>
  )
  deployment: Deployment | undefined
  id: string
  should_guard_entry: (unit: Unit) => boolean
  should_guard_crossover: (unit: Unit) => boolean
  cost: (unit: Unit) => number
}
