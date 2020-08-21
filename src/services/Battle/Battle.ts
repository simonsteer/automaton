import { TurnManager } from './services'
import { Grid } from '../../entities'
import { BattleEvents } from './types'
import { Pathfinder, TypedEventEmitter } from '..'

type BattleCallback<T = void> = (battle: Battle) => T

const DEFAULT_END_CONDITION = (battle: Battle) =>
  battle.grid.getTeams().length === 1

export default class Battle {
  turnIndex = -1
  grid: Grid
  endCondition: BattleCallback<boolean>
  events = new TypedEventEmitter<BattleEvents>()
  private turn?: TurnManager
  isDone = false
  lastTouchedPathfinder?: Pathfinder

  constructor(
    grid: Grid,
    { endCondition = DEFAULT_END_CONDITION } = {} as {
      endCondition?: BattleCallback<boolean>
    }
  ) {
    this.grid = grid
    this.endCondition = endCondition
  }

  advance() {
    if (this.isDone) return
    if (this.turnIndex >= 0 && !this.inProgress) {
      this.isDone = true
      this.events.emit('battleEnd')
      return
    }
    if (this.turnIndex === -1) this.events.emit('battleStart')
    this.events.emit('nextTurn', this.getNextTurn())
  }

  get inProgress() {
    return this.turnIndex !== -1 && !this.endCondition(this)
  }

  getNextTurn = () => {
    this.turnIndex++
    this.turn?.teardown()
    this.turn = new TurnManager(this)
    this.turn.setup()
    return {
      turnIndex: this.turnIndex,
      team: this.turn.team,
      actionableUnits: this.turn.getActionableUnits(),
    }
  }
}
