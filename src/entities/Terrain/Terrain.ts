import Base from '../Base'

export default class Terrain extends Base {
  cost = (unit: Unit) => 1

  constructor(cost: (unit: Unit) => number) {
    super()
    this.cost = cost
  }
}
