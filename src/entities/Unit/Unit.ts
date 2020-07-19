import Base from '../Base'
import { UnitStats } from './types'
import DirectionalConstraint from '../../services/DirectionalConstraint'
import { DEFAULT_DIRECTIONAL_CONSTRAINT } from '../../services/DirectionalConstraint/constants'

export default class Unit extends Base {
  private stats = {
    offense: 1,
    defense: 0,
    speed: 1,
    movement: 1,
    maxHealth: 1,
    numActions: 1,
  }
  private team!: Team
  directionalConstraint = new DirectionalConstraint(
    DEFAULT_DIRECTIONAL_CONSTRAINT
  )

  constructor(
    game: Game,
    { team, stats = {} }: { stats?: Partial<UnitStats>; team: Team }
  ) {
    super(game, 'unit')
    this.setTeam(team).setStats(stats)
  }

  getStats = () => this.stats

  setStats = (updates: Partial<Unit['stats']>) => {
    this.stats = { ...this.stats, ...updates }
    return this
  }

  getTeam = () => this.team

  setTeam = (team: Team) => {
    this.team?.units.delete(this.id)
    this.team = team
    this.team.units.add(this.id)
    return this
  }
}
