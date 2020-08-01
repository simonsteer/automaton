import Unit, { UnitConstructorOptions } from '../../../entities/Unit'
import { blackTeam, whiteTeam } from '..'

export default class ChessPiece extends Unit {
  constructor(
    game: Game,
    {
      team,
      ...restOptions
    }: Omit<UnitConstructorOptions, 'team'> & {
      team: 'black' | 'white'
    }
  ) {
    super(game, {
      team: team === 'black' ? blackTeam : whiteTeam,
      ...restOptions,
    })
  }
}
