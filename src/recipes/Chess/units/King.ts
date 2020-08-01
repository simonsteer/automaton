import ChessPiece from './ChessPiece'
import { Weapon } from '../../../entities'
import { DirectionalConstraint } from '../../../services'

const KING_CONSTRAINT = new DirectionalConstraint({
  offsets: {
    x: [[-1, 1]],
    y: [[-1, 1]],
  },
  exceptions: [({ x, y }) => !(x === 0 && y == 0)],
})

export default class King extends ChessPiece {
  constructor(game: Game, team: 'black' | 'white') {
    super(game, {
      team,
      weapon: new Weapon(game, {
        range: KING_CONSTRAINT,
      }),
      movement: {
        steps: 1,
        pattern: KING_CONSTRAINT,
      },
    })
  }
}
