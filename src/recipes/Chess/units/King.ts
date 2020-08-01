import ChessPiece from './ChessPiece'
import { Weapon } from '../../../entities'
import { DirectionalConstraint } from '../../../services'

const KING_CONSTRAINT = new DirectionalConstraint({
  offsets: {
    x: [[-1, 1]],
    y: [[-1, 1]],
  },
})

export default class Pawn extends ChessPiece {
  constructor(game: Game, team: 'black' | 'white') {
    super(game, {
      team,
      weapon: new Weapon(game, {
        range: new DirectionalConstraint({
          offsets: {
            y: team === 'black' ? [1, 2] : [-1, -2],
            x: [-1, 1],
          },
        }),
      }),
      movement: {
        steps: 1,
        pattern: new DirectionalConstraint({
          offsets: {
            y: team === 'black' ? [1, 2] : [-1, -2],
            x: [0],
          },
        }),
      },
    })
  }
}
