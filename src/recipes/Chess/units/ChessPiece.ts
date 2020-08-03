import { Unit, UnitConfig } from '../../..'
import ChessTeam from '../ChessTeam'

export default class ChessPiece extends Unit {
  constructor({
    team,
    movement = {},
    ...restOptions
  }: Omit<UnitConfig, 'team'> & {
    team: ChessTeam
  }) {
    super({
      team,
      movement: { canPassThroughUnit: () => false, ...movement },
      ...restOptions,
    })
  }
}
