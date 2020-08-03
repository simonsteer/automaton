import { Weapon, RangeConstraint } from '../../..'
import ChessTeam from '../ChessTeam'
import ChessPiece from './ChessPiece'

const QUEEN_CONSTRAINT = new RangeConstraint({
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
  constructor(team: ChessTeam) {
    super({
      team,
      weapon: new Weapon({ range: QUEEN_CONSTRAINT }),
      movement: {
        steps: 1,
        range: QUEEN_CONSTRAINT,
      },
    })
  }
}
