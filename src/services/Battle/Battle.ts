import { Grid, Team } from '../../entities'
import { BattleEvents } from './types'
import { TypedEventEmitter } from '..'

type BattleCallback<G extends Grid, T = void> = (battle: Battle<G>) => T

const DEFAULT_END_CONDITION = <G extends Grid>(battle: Battle<G>) =>
  battle.grid.getTeams().length <= 1

export default class Battle<G extends Grid = Grid> {
  turnIndex = -1
  grid: G
  endCondition: BattleCallback<G, boolean>
  events = new TypedEventEmitter<BattleEvents>()
  private isDone = false

  constructor(
    grid: G,
    { endCondition = DEFAULT_END_CONDITION } = {} as {
      endCondition?: BattleCallback<G, boolean>
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
