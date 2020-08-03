import { Weapon, RangeConstraint } from '../../..'
import ChessTeam from '../ChessTeam'
import ChessPiece from './ChessPiece'

const KNIGHT_CONSTRAINT = new RangeConstraint({
  offsets: {
    y: [-3, -1, 1, 3],
    x: [-3, -1, 1, 3],
  },
  exceptions: [({ x, y }) => Math.abs(x) !== Math.abs(y)],
})
export default class Knight extends ChessPiece {
  constructor(team: ChessTeam) {
    super({
      team,
      weapon: new Weapon({ range: KNIGHT_CONSTRAINT }),
      movement: {
        steps: 1,
        range: KNIGHT_CONSTRAINT,
      },
    })
  }
}
