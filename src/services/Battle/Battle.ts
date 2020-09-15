import { Grid, Team, Unit } from '../../entities'
import { BattleEvents } from './types'
import { TypedEventEmitter } from '..'

const DEFAULT_END_CONDITION = <U extends Unit, G extends Grid<U>>(
  battle: Battle<U, G>
) => battle.grid.getTeams().length <= 1

export default class Battle<U extends Unit, G extends Grid<U>> {
  turnIndex = -1
  grid: G
  endCondition: (battle: Battle<U, G>) => boolean
  events = new TypedEventEmitter<BattleEvents>()
  private isDone = false

  constructor(
    grid: G,
    { endCondition = DEFAULT_END_CONDITION } = {} as {
      endCondition?: Battle<U, G>['endCondition']
    }
  ) {
    this.grid = grid
    this.endCondition = endCondition
  }

  /**
   * Returns the active `Team` according to the `Battle`'s `turnIndex`.
   * */
  getActiveTeam<T extends Team = Team>() {
    const teams = this.grid.getTeams()
    return teams[this.turnIndex % teams.length] as T | undefined
  }

  /**
   * Advances the `Battle`'s `turnIndex`. Emits all `BattleEvents`.
   * */
  nextTurn() {
    if (this.isDone) return
    if (this.turnIndex >= 0 && !this.inProgress) {
      this.isDone = true
      this.events.emit('battleEnd')
      return
    }
    if (this.turnIndex === -1) this.events.emit('battleStart')
    this.turnIndex++
    const nextActiveTeam = this.getActiveTeam()
    if (nextActiveTeam) this.events.emit('nextTurn', nextActiveTeam)
  }

  get inProgress() {
    return this.turnIndex !== -1 && !this.endCondition(this)
  }

  get didEnd() {
    return this.isDone
  }
}
