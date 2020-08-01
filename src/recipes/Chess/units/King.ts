import ChessPiece from './ChessPiece'
import BlackTeam from '../teams/BlackTeam'
import WhiteTeam from '../teams/WhiteTeam'

export default class King extends ChessPiece {
  constructor(game: Game, team: BlackTeam | WhiteTeam) {
    super(game, { team })
  }
}
