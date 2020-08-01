import ChessPiece from './ChessPiece'
import { Weapon } from '../../../entities'
import { DirectionalConstraint } from '../../../services'

const ROOK_CONSTRAINT = new DirectionalConstraint({
  offsets: {
    y: [[-7, 7]],
    x: [[-7, 7]],
  },
  exceptions: [({ x, y }) => (x === 0 && y === 0) || (x !== 0 && y !== 0)],
})
export default class Rook extends ChessPiece {
  constructor(game: Game, team: 'black' | 'white') {
    super(game, {
      team,
      weapon: new Weapon(game, { range: ROOK_CONSTRAINT }),
      movement: {
        steps: 1,
        pattern: ROOK_CONSTRAINT,
      },
    })
  }
}
