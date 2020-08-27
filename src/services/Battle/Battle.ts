import { Grid, Team } from '../../entities'
import { BattleEvents } from './types'
import { TypedEventEmitter } from '..'

type BattleCallback<T = void> = (battle: Battle) => T

const DEFAULT_END_CONDITION = (battle: Battle) =>
  battle.grid.getTeams().length <= 1

export default class Battle {
  turnIndex = -1
  grid: Grid
  endCondition: BattleCallback<boolean>
  events = new TypedEventEmitter<BattleEvents>()
  isDone = false

  constructor(
    grid: Grid,
    { endCondition = DEFAULT_END_CONDITION } = {} as {
      endCondition?: BattleCallback<boolean>
    }
  ) {
    this.grid = grid
    this.endCondition = endCondition
  }

  getActiveTeam() {
    const teams = this.grid.getTeams()
    return teams[this.turnIndex % teams.length] as Team | undefined
  }

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
}
