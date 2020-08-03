import { RangeConstraint, Weapon } from '../../..'
import ChessTeam from '../ChessTeam'
import ChessPiece from './ChessPiece'

const BISHOP_CONSTRAINT = new RangeConstraint({
  offsets: {
    y: [[-7, 7]],
    x: [[-7, 7]],
  },
  exceptions: [({ x, y }) => Math.abs(x) === Math.abs(y)],
})
export default class Queen extends ChessPiece {
  constructor(team: ChessTeam) {
    super({
      team,
      weapon: new Weapon({ range: BISHOP_CONSTRAINT }),
      movement: {
        steps: 1,
        range: BISHOP_CONSTRAINT,
      },
    })
  }
}
