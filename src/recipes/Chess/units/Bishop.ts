import ChessPiece from './ChessPiece'
import { Weapon } from '../../../entities'
import { DirectionalConstraint } from '../../../services'

const BISHOP_CONSTRAINT = new DirectionalConstraint({
  offsets: {
    y: [[-7, 7]],
    x: [[-7, 7]],
  },
  exceptions: [({ x, y }) => Math.abs(x) === Math.abs(y)],
})
export default class Queen extends ChessPiece {
  constructor(game: Game, team: 'black' | 'white') {
    super(game, {
      team,
      weapon: new Weapon(game, { range: BISHOP_CONSTRAINT }),
      movement: {
        steps: 1,
        pattern: BISHOP_CONSTRAINT,
      },
    })
  }
}
