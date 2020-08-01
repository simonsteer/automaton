import ChessPiece from './ChessPiece'
import { Weapon } from '../../../entities'
import { DirectionalConstraint } from '../../../services'

const KNIGHT_CONSTRAINT = new DirectionalConstraint({
  offsets: {
    y: [-3, -1, 1, 3],
    x: [-3, -1, 1, 3],
  },
  exceptions: [({ x, y }) => Math.abs(x) !== Math.abs(y)],
})
export default class Knight extends ChessPiece {
  constructor(game: Game, team: 'black' | 'white') {
    super(game, {
      team,
      weapon: new Weapon(game, { range: KNIGHT_CONSTRAINT }),
      movement: {
        steps: 1,
        pattern: KNIGHT_CONSTRAINT,
      },
    })
  }
}
