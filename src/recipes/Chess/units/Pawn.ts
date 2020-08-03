import { Weapon, RangeConstraint } from '../../..'
import ChessTeam from '../ChessTeam'
import ChessPiece from './ChessPiece'

export default class Pawn extends ChessPiece {
  constructor(team: ChessTeam) {
    super({
      team,
      weapon: new Weapon({
        range: new RangeConstraint({
          offsets: {
            y: team.type === 'black' ? [1, 2] : [-1, -2],
            x: [-1, 1],
          },
        }),
      }),
      movement: {
        steps: 1,
        range: new RangeConstraint({
          offsets: {
            y: team.type === 'black' ? [1, 2] : [-1, -2],
            x: [0],
          },
        }),
      },
    })
  }
}
