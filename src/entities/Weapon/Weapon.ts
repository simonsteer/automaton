import Base from '../Base'
import { DirectionalConstraint } from '../../services'
import { ORTHOGONAL_CONSTRAINT } from '../../services/DirectionalConstraint/recipes'

export default class Weapon extends Base {
  power: number
  range: DirectionalConstraint

  constructor(
    game: Game,
    {
      power = 1,
      range = new DirectionalConstraint(ORTHOGONAL_CONSTRAINT),
    } = {} as {
      power?: number
      range?: DirectionalConstraint
    }
  ) {
    super(game, 'weapon')
    this.power = power
    this.range = range
  }
}
