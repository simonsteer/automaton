import { Game, Unit, Team, Weapon } from '../../entities'
import { DirectionalConstraint } from '../../services'
import { UnitConstructorOptions } from '../../entities/Unit'

const chess = new Game()

export const [blackTeam, whiteTeam] = new Team(chess)
  .split({ branches: 2, siblingRelationship: 'hostile' })
  .get.children()
