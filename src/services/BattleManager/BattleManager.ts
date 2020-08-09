import { TurnManager } from './services'
import { Grid } from '../../entities'
import { EventEmitter } from 'events'
import { BattleEvents } from './types'

type BattleManagerCallback<T = void> = (battle: BattleManager) => T

const DEFAULT_END_CONDITION = (battle: BattleManager) =>
  battle.grid.getTeams().length === 1

export default class BattleManager {
  turnIndex = -1
  grid: Grid
  endCondition: BattleManagerCallback<boolean>
  private emitter = new EventEmitter()
  isDone = false

  on<EventName extends keyof BattleEvents>(
    event: EventName,
    callback: BattleEvents[EventName]
  ) {
    this.emitter.on(event, callback)
  }

  off<EventName extends keyof BattleEvents>(
    event: EventName,
    callback: BattleEvents[EventName]
  ) {
    this.emitter.off(event, callback)
  }

  emit<EventName extends keyof BattleEvents>(
    event: EventName,
    ...args: Parameters<BattleEvents[EventName]>
  ) {
    this.emitter.emit(event, ...args)
  }

  constructor(
    grid: Grid,
    { endCondition = DEFAULT_END_CONDITION } = {} as {
      endCondition?: BattleManagerCallback<boolean>
    }
  ) {
    this.grid = grid
    this.endCondition = endCondition
  }

  advance() {
    if (this.isDone) {
      return
    }
    if (this.turnIndex >= 0 && !this.inProgress) {
      this.isDone = true
      this.emit('battleEnd')
      return
    }
    if (this.turnIndex === -1) this.emit('battleStart')
    this.emit('nextTurn', this.getNextTurn())
  }

  get inProgress() {
    return this.turnIndex !== -1 && !this.endCondition(this)
  }

  getNextTurn = () => {
    this.turnIndex++
    const turn = new TurnManager(this)
    return {
      turnIndex: this.turnIndex,
      team: turn.team,
      actionableUnits: turn.getActionableUnits(),
    }
  }
}
