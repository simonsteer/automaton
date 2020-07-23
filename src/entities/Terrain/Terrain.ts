import Base from '../Base'

export default class Terrain extends Base {
  cost = (unit: Unit) => 1
  cache = new Map<Symbol, number>()

  constructor(game: Game, cost?: (unit: Unit) => number) {
    super(game, 'terrain')
    if (cost) this.cost = cost
  }
}
