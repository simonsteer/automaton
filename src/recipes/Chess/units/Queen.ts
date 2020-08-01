import ChessPiece from './ChessPiece'
import { Weapon } from '../../../entities'
import { DirectionalConstraint } from '../../../services'

const QUEEN_CONSTRAINT = new DirectionalConstraint({
  offsets: {
    y: [[-7, 7]],
    x: [[-7, 7]],
  },
  exceptions: [
    ({ x, y }) => {
      const isDiagonalMovement = Math.abs(x) === Math.abs(y)
      const isOrthogonalMovement = (x !== 0 && y === 0) || (x === 0 && y !== 0)
      return !isDiagonalMovement || !isOrthogonalMovement
    },
  ],
})
export default class Queen extends ChessPiece {
  constructor(game: Game, team: 'black' | 'white') {
    super(game, {
      team,
      weapon: new Weapon(game, { range: QUEEN_CONSTRAINT }),
      movement: {
        steps: 1,
        pattern: QUEEN_CONSTRAINT,
      },
    })
  }
}
